const express = require("express");
const mongoose = require("mongoose");
const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const authorization = require("../middleware/authorization");
const admin = require("../middleware/admin");

const router = express.Router();

/* ----- Read ----- */
router.get("/", async (req, res) => {
	throw new Error("Movies are not available")
	const movies = await Movie.find().sort({ title: 1 });
	// Return the movies
	res.send(movies);
});

router.get("/:id", async (req, res) => {
	const movie = await Movie.findById(req.params.id);
	if (!movie)
		return res.status(404).send(`The movie with the given ID was not found`);

	// Return the movie
	res.send(movie);
});

/* ----- Write ----- */
router.post("/", authorization, async (req, res) => {
	try {
		// Validate the Input
		const input = validate(req.body);
		if (!input.success)
			return res.status(400).send(input.error.issues[0].message);

		// Validating Genre
		const genre = await Genre.findById(req.body.genreId);
		if (!genre) return res.status(400).send("Invalid genre");

		// Add Movie
		const movie = new Movie({
			title: req.body.title,
			genre: {
				_id: genre._id,
				name: genre.name,
			},
			numberInStock: req.body.numberInStock,
			dailyRentalRate: req.body.dailyRentalRate,
		});
		await movie.save();

		// Return the New Movie
		res.send(movie);
	} catch (error) {
		console.error("Error in creating a movie:", error);
		res.status(500).send("Internal Server Error");
	}
});

/* ----- Update ----- */
router.put("/:id", authorization, async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	// Validating Genre
	const genre = await Genre.findById(req.body.genreId);
	if (!genre) return res.status(400).send("Invalid genre");

	const movie = await Movie.findByIdAndUpdate(
		req.params.id,
		{
			title: req.body.title,
			genre: {
				_id: genre._id,
				name: genre.name,
			},
			numberInStock: req.body.numberInStock,
			dailyRentalRate: req.body.dailyRentalRate,
		},
		{ new: true }
	);
	if (!movie)
		return res.status(404).send(`The movie with the given ID was not found`);

	// Return the Updated Movie
	res.send(movie);
});

/* ----- Delete ----- */
router.delete("/:id", [authorization, admin], async (req, res) => {
	const movie = await Movie.findOneAndDelete({ _id: req.params.id });
	if (!movie)
		return res.status(404).send(`The movie with the given ID was not found`);

	// Return the Deleted Movie
	res.send(movie);
});

module.exports = router;
