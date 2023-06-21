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
		expect(job.id).toBeNumber()
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


/********************************* get */
describe('get', function(){
	test('works', async () => {
		const job = await Company.get()
	})
})

/********************************** update */


/***************************** remove */