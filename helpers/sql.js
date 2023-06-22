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
 * Returns an object with custom conditional statement to filter companies 
 * based on any combination of name, minEmployees, maxEmployees as query params 
 * and a list of the query param values.
 * 
 * {
 *    condStatement : `%name% ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
 *    values : [name, minEpmloyees, maxEmployees]
 * }
 * 
 */
function sqlForCompFilter(queryParams) {
  const keys = Object.keys(queryParams);
  
  if(keys.length === 0) throw new BadRequestError("No data");

  if (queryParams.name) queryParams["name"] = `%${queryParams.name}%`;
  
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
 * Returns an object with custom conditional statement to filter jobs 
 * based on any combination of title, minSalary, hasEquity query params 
 * and a list of the query param values.
 * 
 *  {
 *    condSatement : 'title ILIKE $1 AND salary >= $2 AND equity > 0',
 *    values: ["%engineer%", 100000]
 *  }
 */
function sqlForJobFilter(queryParams) {
  const keys = Object.keys(queryParams);
  if(keys.length === 0) throw new BadRequestError("No data");
  if (queryParams.title) queryParams["title"] = `%${queryParams.title}%`;
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
  return {
    condStatement : conditions.join(" AND "),
    values : values
  }
}

module.exports = { 
  sqlForPartialUpdate, 
  sqlForCompFilter,
  sqlForJobFilter };
