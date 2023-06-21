const jsonschema = require('jsonschema')
const express = require("express");

const router = new express.Router();

const Job = require("../models/job")
const { ensureAdmin } = require("../middleware/auth")

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate")
const { BadRequestError } = require('../expressError');

/**
 * POST / Admins can create a new job, otherwise unauthorized.
 * Data {title, salary, equity, companyHandle}
 * 
 * Return {id, title, salary, equity, companyHandle}
 */
router.post('/', ensureAdmin, async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		};
		const result = await Job.create(req.body)
		return res.json(result)
	} catch(e) {
		return next(e)
	}
})

/**
 * GET / Get all jobs.
 * returns [{id, title, salary, equity, companyHandle}]
 */
router.get('/', async (req, res, next) => {
	try{
		const results = await Job.findAll();
		return res.json(results)
	} catch(e){
		return next(e)
	}
})

/**
 * GET / get a job
 * :id => {id, title, salary, equity, companyHandle}
 */
router.get('/:id', async(req, res, next) => {
	try {
		const job = await Job.get(req.params.id)
		return res.json(job)
	} catch(e) {
		return next(e)
	}
})

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