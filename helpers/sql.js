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

function sqlForFilter(queryParams) {
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

module.exports = { sqlForPartialUpdate, sqlForFilter };
