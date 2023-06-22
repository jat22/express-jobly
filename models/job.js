const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForJobFilter } = require('../helpers/sql')

class Job {
	/** Create a job (from data), update db, return new job data.
	 * 
	 * data should be { title, salary, equity, companyHandle }
	 * 
	 * return { id, title, salary, equity, companyHandle}
	 */
	static async create({ title, salary, equity, companyHandle }){
		const checkCompany = await db.query(
			`SELECT handle
			FROM companies
			WHERE handle = $1`,
			[ companyHandle ]
		)
		if(!checkCompany) throw new BadRequestError(`${companyHandle} not found`)
		const result = await db.query(
			`INSERT INTO jobs
			(title, salary, equity, company_handle)
			VALUES ($1, $2, $3, $4)
			RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, [title, salary, equity, companyHandle]
		);
		const job = result.rows[0];
		return job;
	}
	/** Find all jobs
	 * 
	 * Returns [{id, title, salary, equity, companyHandle}, ...]
	 */
	static async findAll() {
		const results = await db.query(
			`SELECT id, 
				title, 
				salary, 
				equity, 
				company_handle AS "companyHandle"
			FROM jobs
			ORDER BY title`
		)
		return results.rows
	};

	/**
	 * filter jobs based on query params:
	 * 			{ title, minSalary(integer), hasEquity(true/false)}
	 * 
	 * returns list of jobs fitting params:
	 * 			[ { id, title, salary, equity, companyHandle }, ...]
	 */

	static async filter(query){
		const { condStatement, values } = sqlForJobFilter(query)
		const sqlQuery = 
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
			FROM jobs
			WHERE ${condStatement}
			ORDER BY title`;
		const jobRes = await db.query(sqlQuery, values);
		if(jobRes.rows === 0) 
			throw new NotFoundError("No jobs found with query params");
		return jobRes.rows
	}

	/** Find a specific job by ID
	 * 
	 * returns {id, title, salary, equity, companyHanlde}
	 * 
	 * BadRequestError if a job with provided id doesn't exist
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id,
					title,
					salary,
					equity,
					company_handle AS "companyHandle"
			FROM jobs
			WHERE id=$1`,
			[id]
		);
		if (result.rows.length === 0) 
			throw new NotFoundError(`Job with id ${id} not found`);
		return result.rows[0]
	};

	/**Update a job
	 * Title, salary and equity can be updated. Pass job id and only data 
	 * being updated.
	 * 
	 * {id, <title, salary, equity>} => 
	 * 
	 * 	returns {id, title, salary, equity, companyHanlde}
	 * 
	 * BadRequestError if a job with provided id doesn't exist
	 */
	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data,{});
		const idVarIdx = `$${values.length + 1}`

		const sql = `UPDATE jobs
					SET ${setCols}
					WHERE id = ${idVarIdx}
					RETURNING
						id, title, salary, equity, company_handle AS "companyHandle"`

		const result = await db.query(sql, [...values, id]);
		if (result.rows.length === 0) 
			throw new NotFoundError(`Job with id ${id} not found`);
		return result.rows[0]
	};

	/**delete a job
	 * id => {id, title}
	 * 
	 * NotFoundError if job doesn't exist
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE
			FROM jobs
			WHERE id = $1
			RETURNING id, title`,
			[id]
		);
		const job = result.rows[0];
		if(!job) throw new NotFoundError(`Job with id ${id} not found`);
		return job
	}
}

module.exports = Job