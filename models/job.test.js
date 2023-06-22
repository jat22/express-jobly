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
		const jobId = await db.query(
			`SELECT id FROM jobs WHERE title='test'`
		)
		expect(job.id).toEqual(jobId.rows[0].id);
	})
	test('error if company does not exist', async () => {
		try{
			const job = await Job.create({
				title : "test",
				salary : 60000,
				equity : 0.06,
				companyHandle : "abcd"
			})
		} catch(e){
			expect(e instanceof BadRequestError).toBeTruthy
		}
	})
});

/******************************** findAll */
describe("findAll", function () {
	test('works', async () => {
		const results = await Job.findAll();
		expect(results.length).toBe(3)
		expect(Object.keys(results[0]).length).toBe(5)
	})
});

/******************************** filter */
describe("filter", function () {
	test("all params", async() => {
		const results = await Job.filter({title:"j1", minSalary : 20000, hasEquity : true})
		expect(results.length).toBe(1)
	})
	test("title, case-insensitive", async() => {
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
	});
	test("no jobs found", async() => {
		try{
			const results = await Job.filter({title :"qwerty"})
		} catch(e){
			expect(e instanceof NotFoundError).toBeTruthy;
		}
		
	})
})

describe("get", () => {
	test('works', async() => {
		const jobRes = await db.query(
			`SELECT id FROM jobs WHERE title='J1'`
		);
		const jobId = jobRes.rows[0].id;
		const result = await Job.get(jobId);

		expect(result).toStrictEqual(
			{
				id: jobId,
				title : 'J1',
				salary : 50000,
				equity : '0.05',
				companyHandle : 'c1'
			}
		);
	})
	test('error if job does not exist', async()=> {
		try {
			const result = await Job.get(10000);
		} catch(e){
			expect(e instanceof NotFoundError).toBeTruthy;
		}
	})
});

describe("update", () => {
	test("works", async()=>{
		const jobRes = await db.query(
			`SELECT id FROM jobs WHERE title='J1'`
		);
		const jobId = jobRes.rows[0].id;
		const data = {
			title : "new j1",
			salary : 100000,
			equity : 0
		};
		const result = await Job.update(jobId, data);

		expect(result).toStrictEqual(
			{
				id : jobId,
				title : 'new j1',
				salary : 100000,
				equity : '0',
				companyHandle : 'c1'
			}
		);
	});
	test("error if job dne", async () => {
		try{
			const data = {
				title : "new j1",
				salary : 100000,
				equity : 0
			};
			const result = await Job.update(100000,data);
		} catch(e){
			expect(e instanceof NotFoundError).toBeTruthy
		}
	});
});

describe("remove", () => {
	test("works", async()=>{
		const jobRes = await db.query(
			`SELECT id FROM jobs WHERE title='J1'`
		);
		const jobId = jobRes.rows[0].id;
		const result = await Job.remove(jobId);

		expect(result).toStrictEqual(
			{
				id : jobId,
				title : 'J1',
			}
		);
	});
	test("error if job dne", async () => {
		try{
			const result = await Job.remove(100000);
		} catch(e){
			expect(e instanceof NotFoundError).toBeTruthy
		}
	});
});