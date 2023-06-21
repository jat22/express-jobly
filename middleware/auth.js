"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
//////////////????????res.locals.user vs. req.user ?????????????????/

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when user must be an admin.
 * 
 * raises Unauthorized if no user login or if user not admin
 */
function ensureAdmin(req, res, next) {
  try{
    if (!res.locals.user) throw new UnauthorizedError();
    if (!res.locals.user.isAdmin) throw new UnauthorizedError();
    return next();
  } catch(e){
    return next(e)
  }
}

/** Middleware to use when only user or admin can access user data.
 * 
 * raises Unauthorized if no user login, if user not admin, or 
 * attempting to access user data that is not their own.
 */

function ensureCorrectUser(req, res, next) {
  try{
    if (!res.locals.user) throw new UnauthorizedError();
    if (res.locals.user.isAdmin) return next();
    if (res.locals.user.username !== req.params.username) throw new UnauthorizedError();
    return next();
  } catch(e){
    return next(e)
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser
};
