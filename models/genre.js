const zod = require("zod");
const mongoose = require("mongoose");

// Defining a Schema
const genreSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50,
	},
});

// Creating Model
const Genre = mongoose.model("Genre", genreSchema);

// Validation Logic
const validateGenre = (genre) => {
	const Schema = zod.object({
		name: zod.string().min(3).max(50),
	});

	return Schema.safeParse(genre);
};

module.exports.genreSchema = genreSchema;
module.exports.Genre = Genre;
module.exports.validate = validateGenre;
