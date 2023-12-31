const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const zod = require("zod");
const bcrypt = require("bcrypt");

const router = express.Router();

/* ----- Write ----- */
router.post("/", async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	// Validate Email
	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send(`Invalid Email or Password.`);

	// Validate Password
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send(`Invalid Email or Password.`);

  const token = user.generateAuthToken();
	res.send(token);
});

// Validation Logic
const validate = (req) => {
	const Schema = zod.object({
		email: zod
			.string()
			.min(5)
			.max(255)
			.email({ message: "Please enter a valid email address." }),
		password: zod.string().min(8),
	});

	return Schema.safeParse(req);
};

module.exports = router;
