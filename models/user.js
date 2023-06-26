"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { generatePassword } = require("../helpers/password")

const { BCRYPT_WORK_FACTOR, PASSWORD_LENGTH } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, firstName, lastName, email, password, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }
    
    // if admin is registering, password is generated randomly
    if (password === '') password = generatePassword(PASSWORD_LENGTH);
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT
              u.username,
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              u.email,
              u.is_admin AS "isAdmin",
              CASE
                WHEN COUNT(a.username) = 0 THEN ARRAY[NULL]::json[]
                ELSE
                ARRAY_AGG(
                json_build_object(
                  'jobId', a.job_id, 
                  'currentStatus', a.current_status)
                )
              END AS jobs
          FROM users AS u
            LEFT JOIN applications AS a
            ON u.username = a.username
          WHERE 
            u.username = $1
          GROUP BY
            u.username`,
        [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
  /**
   * Add application to applications table
   * { username, jobId, status } => { jobId, currentStatus}
   */
  static async apply(username, jobId, currentStatus){
    const checkJob = await db.query(
      `SELECT id FROM jobs WHERE id=$1`, [jobId]);
    if(checkJob.rows.length === 0) 
      throw new BadRequestError("Job does not exist");

    const checkUser = await db.query(
      `SELECT username FROM users WHERE username=$1`, [username])
    if(checkUser.rows.length === 0)
      throw new BadRequestError("User does not exist");

    const result = await db.query(
      `INSERT INTO applications
        (username, job_id, current_status)
      VALUES
        ($1, $2, $3)
      RETURNING
        job_id AS "jobId", current_status AS "currentStatus"`,
      [username, jobId, currentStatus]
    )
    return result.rows[0]
  }

  static async updateApply(username, jobId, currentStatus){
    const checkApplication = await db.query(
      `SELECT username FROM applications WHERE username=$1 AND job_id=$2`,
      [username, jobId]
    )
    if(checkApplication.rows.length === 0){
      throw new BadRequestError("Application does not exist");
    }

    const result = await db.query(
      `UPDATE applications
      SET current_status=$1
      WHERE username=$2 AND job_id=$3
      RETURNING username, 
                job_id AS "jobId", 
                current_status AS "currentStatus"`,
      [currentStatus, username, jobId]
    );

    return result.rows[0]
  }
}


module.exports = User;
