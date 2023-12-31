const express = require("express");
const mongoose = require("mongoose");
const { Customer, validate } = require("../models/customer");
const authorization = require("../middleware/authorization");

const router = express.Router();

/* ----- Read ----- */
router.get("/", authorization, async (req, res) => {
	const customers = await Customer.find().sort({ name: 1 });
	// Return the customers
	res.send(customers);
});

router.get("/:id", authorization, async (req, res) => {
	const customer = await Customer.findById(req.params.id);
	if (!customer)
		return res.status(404).send(`The customer with the given ID was not found`);

	// Return the customer
	res.send(customer);
});

/* ----- Write ----- */
router.post("/", authorization, async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	// Add Customer
	const customer = new Customer({
		isGold: req.body.isGold,
		name: req.body.name,
		phone: req.body.phone,
	});
	await customer.save();

	// Return the New Customer
	res.send(customer);
});

/* ----- Update ----- */
router.put("/:id", authorization, async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	const customer = await Customer.findByIdAndUpdate(
		req.params.id,
		{ name: req.body.name, isGold: req.body.isGold, phone: req.body.phone },
		{ new: true }
	);
	if (!customer)
		return res.status(404).send(`The customer with the given ID was not found`);

	// Return the Updated Customer
	res.send(customer);
});

/* ----- Delete ----- */
router.delete("/:id", authorization, async (req, res) => {
	const customer = await Customer.findOneAndDelete({ _id: req.params.id });
	if (!customer)
		return res.status(404).send(`The customer with the given ID was not found`);

	// Return the Deleted Customer
	res.send(customer);
});

module.exports = router;
