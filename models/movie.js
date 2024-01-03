const zod = require("zod");
const mongoose = require("mongoose");
const { genreSchema } = require('./genre');

// Creating Model
const Movie = mongoose.model(
	"Movie",
	new mongoose.Schema({
    title: {
      type: String,
			required: true,
      trim: true,
			minlength: 3,
      maxlength: 255,
    },
    genre: {
      type: genreSchema,
      ref: 'genre',
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
	})
);

// Validation Logic
const validateMovie = (movie) => {
	const Schema = zod.object({
		title: zod.string().min(2),
		genreId: zod.string().refine((val) => val.length === 24, {
			message: "Invalid genreId",
		}),
		numberInStock: zod.number().nonnegative(),
		dailyRentalRate: zod.number().nonnegative(),
	});

	return Schema.safeParse(movie);
};

module.exports.Movie = Movie;
module.exports.validate = validateMovie;
