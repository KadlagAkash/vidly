const zod = require("zod");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

// Defining Schema
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 150,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		minlength: 5,
		maxlength: 255,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 1024,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{ _id: this._id, isAdmin: this.isAdmin },
		config.get("jwtPrivateKey")
	);
	return token;
};

const User = mongoose.model("User", userSchema);

// Validation Logic
const validateUser = (user) => {
	const Schema = zod.object({
		name: zod.string().min(3).max(150),
		email: zod
			.string()
			.min(5)
			.max(255)
			.email({ message: "Please enter a valid email address." }),
		password: zod
			.string()
			.min(
				8,
				"Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character."
			)
			.refine((password) => {
				// At least one uppercase letter, one lowercase letter, one digit, and one special character
				const passwordRegex =
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
				return passwordRegex.test(password);
			}, "Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character."),
	});

	return Schema.safeParse(user);
};

module.exports.User = User;
module.exports.validate = validateUser;
