const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate, sqlForFilter, sqlForCompFilter, sqlForJobFilter } = require('./sql')

describe("Create sql for partial update", function () {
	test("creates sql", function () {
		const newData = {
			"testValue1" : "new value1",
			"testValue2" : "new value2"
		};
		const jstoSql = {
			testValue1 : "test_value1",
			testValue2 : "test_value2"
		};
		const result = sqlForPartialUpdate(newData, jstoSql)
	
		expect(result).toStrictEqual({
			setCols :`"test_value1"=$1, "test_value2"=$2`,
			values : ["new value1", "new value2"]
		});
	})
	test("no data", function() {
		const newData = {}
		const jstoSql = {
			testValue1 : "test_value1",
			testValue2 : "test_value2"
		};
		try{
			sqlForPartialUpdate(newData, jstoSql)
		} catch(e){
			expect(e instanceof BadRequestError).toBeTruthy();
		}
	})
	test("no jstoSql", function() {
		const newData = {
			"testValue1" : "new value1",
			"testValue2" : "new value2"
		};
		const jstoSql = {};
		const result = sqlForPartialUpdate(newData, jstoSql);
		expect(result).toStrictEqual({
			setCols :`"testValue1"=$1, "testValue2"=$2`,
			values : ["new value1", "new value2"]
		});
	})
});

describe("Create sql for company filter", function(){
	test("works", function () {
		const queryParams = {
			"name" : "new name",
			"minEmployees" : 100,
			"maxEmployees" : 200
		};
		const result = sqlForCompFilter(queryParams)
	
		expect(result).toStrictEqual({
			condStatment :`name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
			values : ["%new name%", 100, 200]
		});
	});
	test("works with only name", function () {
		const queryParams = {
			"name" : "new name",
		};
		const result = sqlForCompFilter(queryParams)
	
		expect(result).toStrictEqual({
			condStatment :`name ILIKE $1`,
			values : ["%new name%"]
		});
	});
	test("works with only minEmployees", function () {
		const queryParams = {
			"minEmployees" : 100
		};
		const result = sqlForCompFilter(queryParams)
	
		expect(result).toStrictEqual({
			condStatment :`num_employees >= $1`,
			values : [100]
		});
	});
	test("works with only maxEmployees", function () {
		const queryParams = {
			"maxEmployees" : 200
		};
		const result = sqlForCompFilter(queryParams)
	
		expect(result).toStrictEqual({
			condStatment :`num_employees <= $1`,
			values : [200]
		});
	});
	test("no data", function() {
		const queryParams = {}

		try{
			sqlForCompFilter(queryParams)
		} catch(e){
			expect(e instanceof BadRequestError).toBeTruthy();
		}
	})
});

describe("Create sql of job filter", function(){
	test('works', () =>{
		const queryParams = {
			"title" : "engineer",
			"minSalary" : 100000,
			"hasEquity" : true
		};
		const result = sqlForJobFilter(queryParams);

		expect(result).toStrictEqual({
			condStatement : `title ILIKE $1 AND salary >= $2 AND equity > 0`,
			values: ['%engineer%', 100000]
		});
	});
	test('with only title', () => {
		const queryParams = {
			"title" : "engineer"
		};
		const result = sqlForJobFilter(queryParams);

		expect(result).toStrictEqual({
			condStatement : `title ILIKE $1`,
			values: ['%engineer%']
		});
	});
	test('with only salary', () =>{
		const queryParams = {
			"minSalary" : 100000
		};
		const result = sqlForJobFilter(queryParams);

		expect(result).toStrictEqual({
			condStatement : `salary >= $1`,
			values: [100000]
		});
	});
	test('with only equity', () =>{
		const queryParams = {
			"hasEquity" : true
		};
		const result = sqlForJobFilter(queryParams);

		expect(result).toStrictEqual({
			condStatement : `equity > 0`,
			values: []
		});
	});
	test("no data", function() {
		const queryParams = {}

		try{
			sqlForJobFilter(queryParams)
		} catch(e){
			expect(e instanceof BadRequestError).toBeTruthy();
		}
	}) 
});