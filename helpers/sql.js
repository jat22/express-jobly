const { query } = require("express");
const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/** Returns an object with a string of SQL assigning new
 * values to specified columns and a list of those values.
 * 
 * {
 *  setCols : `"column_name = $1", ...`
 *  values : [<new value>,...] 
 * }
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * Returns an object with conditional statements and values to be 
 * used in an sql query when filtering companies
 */
function sqlForCompFilter(queryParams) {
  if (queryParams.name) queryParams["name"] = `%${queryParams.name}%`
  const keys = Object.keys(queryParams);
  const conditions = keys.map((q, i) => {
    if (q === "name"){
      return `name ILIKE $${i + 1}`
    }
    if (q === "minEmployees"){
      return `num_employees >= $${i + 1}`
    }
    if (q === "maxEmployees"){
      return `num_employees <= $${i + 1}`
    }
  })
  return {
    condStatment : conditions.join(" AND "),
    values : Object.values(queryParams)
  }
}

/**
 * Returns an object with conditional statements and values to be 
 * used in an sql query when filtering jobs
 * 
 * {title : "engineer", minSalary : 100000, hasEquity : true} =>
 *    {
 *       condSatement : 'title ILIKE $1 AND salary >= $2 AND equity > 0',
 *       values: ["engineer", 100000]
 *    }
 */
function sqlForJobFilter(queryParams) {
  if (queryParams.title) queryParams["title"] = `%${queryParams.title}%`;
  const keys = Object.keys(queryParams);
  const values = Object.values(queryParams)
  const conditions = keys.map((q, i) => {
    if (q === "title"){
      return `title ILIKE $${i + 1}`
    }
    if (q === "minSalary"){
      return `salary >= $${i + 1}`
    }
    if (q === "hasEquity"){
      if (queryParams.hasEquity) {
        values.splice(i, 1);
        return `equity > 0`
      }
    }
  })
  const sql = {
    condStatement : conditions.join(" AND "),
    values : values
  }
  return sql
}

module.exports = { 
  sqlForPartialUpdate, 
  sqlForCompFilter,
  sqlForJobFilter };
