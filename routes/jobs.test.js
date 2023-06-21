const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", () => {
	const newJob = {
		title : "test job1",
		salary : 100000,
		equity : 0.056,
		companyHandle : "c1"
	};
	test('works for admin', async () => {
		const resp = await request(app)
			.post("/jobs")
			.send(newJob)
			.set("authorization", `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(201);
	});
	test('unauthorized for users', async () => {
		const resp = await request(app)
			.post("/jobs")
			.send(newJob)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
	test("bad request with missing data", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
			  title : "testing",
			})
			.set("authorization", `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(400);
	  });
	
	  test("bad request with invalid data", async function () {
		const resp = await request(app)
			.post("/companies")
			.send({
			  title : "testing",
			  salary : "this is not an integer",
			  equity : 0.054,
			  companyHandle : "c1"
			})
			.set("authorization", `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(400);
	  });
})

describe("GET /jobs", () => {
	test("works", async () => {
		const resp = await request(app).get('/jobs')
		expect(resp.statusCode).toBe(200)
	})

})

describe("GET /jobs/:id", () => {
	test('works', async() => {
		const idRes = await db.query(`SELECT id FROM jobs`)
		const testId = idRes.rows[0].id
		const resp = await request(app).get(`/jobs/${testId}`)
		expect(resp.statusCode).toBe(200)
	})
	test("no job found", async() => {
		const resp = await request(app).get(`/jobs/100000`)
		expect(resp.statusCode).toBe(400)
	})
})

describe("PATCH /jobs/:id", () => {
	test("unauthorized for users", async function () {
		const idRes = await db.query(`SELECT id FROM jobs`)
		const testId = idRes.rows[0].id
		const resp = await request(app)
			.patch(`/jobs/${testId}`)
			.send({
			  title: "j1-new",
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(401);
	});

	test("unauth for anon", async function () {
	const idRes = await db.query(`SELECT id FROM jobs`)
	const testId = idRes.rows[0].id
	const resp = await request(app)
		.patch(`/jobs/${testId}`)
		.send({
			title: "j1-new",
		});
	expect(resp.statusCode).toBe(401);
	});

	test("not found on no such company", async function () {
	const resp = await request(app)
		.patch(`/jobs/1000000`)
		.send({
			title: "new nope",
		})
		.set("authorization", `Bearer ${u2Token}`);
	expect(resp.statusCode).toEqual(400);
	});

	test("bad request on handle change attempt", async function () {
	const resp = await request(app)
		.patch(`/companies/c1`)
		.send({
			handle: "c1-new",
		})
		.set("authorization", `Bearer ${u2Token}`);
	expect(resp.statusCode).toEqual(400);
	});

	test("bad request on invalid data", async function () {
	const resp = await request(app)
		.patch(`/companies/c1`)
		.send({
			logoUrl: "not-a-url",
		})
		.set("authorization", `Bearer ${u2Token}`);
	expect(resp.statusCode).toEqual(400);
	});
})
