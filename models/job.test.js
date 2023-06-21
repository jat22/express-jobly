const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/***************************** create */

describe("create", function() {
	const newJob = {
		title : "test",
		salary : 60000,
		equity : 0.06,
		companyHandle : "c1"
	}
	test('works', async () => {
		const job = await Job.create(newJob);
		expect(job.title).toEqual(newJob.title);
	})
})

/******************************** findAll */
describe("findAll", function () {
	test('works', async () => {
		const results = await Job.findAll();
		expect(results.length).toBe(3)
	})
});

/******************************** filter */
describe("filter by title", function () {
	test("all params", async() => {
		const results = await Job.filter({title:"j1", minSalary : 20000, hasEquity : true})
		expect(results.length).toBe(1)
	})
	test("title", async() => {
		const results = await Job.filter({title:"j1"})
		expect(results.length).toBe(1)
	})
	test("minSalary", async() => {
		const results = await Job.filter({minSalary : 20000})
		expect(results.length).toBe(2)
	})
	test("hasEquity", async() => {
		const results = await Job.filter({hasEquity : true})
		expect(results.length).toBe(3)
	})
})

