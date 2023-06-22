const jsonschema = require('jsonschema')
const express = require("express");

const router = new express.Router();

const Job = require("../models/job")
const { ensureAdmin } = require("../middleware/auth")

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate")
const jobFilterSchema = require('../schemas/jobFilter.json')
const { BadRequestError } = require('../expressError');

/**
 * POST / { job } => { job }
 * job in should be {title, salary, equity, companyHandle}
 * 
 * Return job {id, title, salary, equity, companyHandle}
 * 
 * Authorization required: admin
 */
router.post('/', ensureAdmin, async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		};
		const result = await Job.create(req.body)
		return res.status(201).json(result)
	} catch(e) {
		return next(e)
	}
})

/**
 * GET / [optional: ? title & minSalary & hasEquity]
 * 		=> [{ job }, ...]
 * 
 * job is
 * 		{id, title, salary, equity, companyHandle}
 * 
 * Authorization required: none
 */
router.get('/', async (req, res, next) => {
	const query = req.query;
	try{
		if(Object.keys(query).length > 0){
			if(query.hasOwnProperty("minSalary"))
				query["minSalary"] = parseInt(query.minSalary);
			if(query.hasOwnProperty("hasEquity"))
				query["hasEquity"] = Boolean(query.hasEquity);
			const validator = jsonschema.validate(query, jobFilterSchema);
			if (!validator.valid){
				const errs = validator.errors.map(e => e.stack);
				throw new BadRequestError(errs);
			}

			const jobs = await Job.filter(query);
			return res.json({ jobs })
		}
		const results = await Job.findAll();
		return res.json(results)
	} catch(e){
		return next(e)
	}
})

/**
 * GET / [id] => { job }
 * 
 * Job is
 * 		{id, title, salary, equity, companyHandle}
 * 
 * Authorization required: none
 */
router.get('/:id', async(req, res, next) => {
	try {
		const job = await Job.get(req.params.id)
		return res.json(job)
	} catch(e) {
		return next(e)
	}
})

/**
 * PATCH / [id] => { job }
 * 
 * job is
 * 		{id, title, salary, equity, companyHandle}
 * 
 * Authorization required: admin
 */
router.patch('/:id', ensureAdmin, async (req, res, next) => {
	try{
		const validator = jsonschema.validate(req.body, jobUpdateSchema);
		if(!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const job = await Job.update(req.params.id, req.body);
		return res.json(job)
	} catch(e){
		return next(e)
	}
})

/** DELETE / [id] => { deleted: { job } }
 * 
 * job is
 * 		{id, title}
 * 
 *  Authorization required: admin
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
	try{
		const job = await Job.remove(req.params.id);
		return res.json({
			deleted : 
				{
					id : job.id, 
					title : job.title
				}
			})
	} catch(e) {
		return next(e)
	}
})

module.exports = router