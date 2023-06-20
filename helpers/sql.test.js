const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql')

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