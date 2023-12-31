const express = require("express");
const mongoose = require("mongoose");
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const authorization = require("../middleware/authorization");

const router = express.Router();

/* ----- Getting current user ----- */
router.get("/me", authorization, async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');
	res.send(user);
});

/* ----- Creating a User ----- */
router.post("/", async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	let user = await User.findOne({ email: req.body.email });

	// Check if User already Exists
	if (user) return res.status(400).send(`User already registered.`);

	// Create New User
	user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});
	user.password = await bcrypt.hash(user.password, 10);
	await user.save();

	// Return the New User
	const token = user.generateAuthToken();
	const { _id, name, email } = user;
	res.header("x-auth-token", token).send({ _id, name, email });
});

module.exports = router;
