const express = require("express");
const mongoose = require("mongoose");
const { Genre, validate } = require("../models/genre");
const authorization = require("../middleware/authorization");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

/* ----- Read ----- */
router.get("/", async (req, res) => {
	const genres = await Genre.find().sort({ name: 1 });
	// Return the genres
	res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
	const genre = await Genre.findById(req.params.id);
	if (!genre)
		return res.status(404).send(`The genre with the given ID was not found`);

	// Return the genre
	res.send(genre);
});

/* ----- Write ----- */
router.post("/", authorization, async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	// Add Genre
	const genre = new Genre({
		name: req.body.name,
	});
	await genre.save();

	// Return the New Genre
	res.send(genre);
});

/* ----- Update ----- */
router.put("/:id", [authorization, validateObjectId], async (req, res) => {
	// Validate the Input
	const input = validate(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	const genre = await Genre.findByIdAndUpdate(
		req.params.id,
		{ name: req.body.name },
		{ new: true }
	);
	if (!genre)
		return res.status(404).send(`The genre with the given ID was not found`);

	// Return the Updated Genre
	res.send(genre);
});

/* ----- Delete ----- */
router.delete(
	"/:id",
	[authorization, admin, validateObjectId],
	async (req, res) => {
		const genre = await Genre.findOneAndDelete({ _id: req.params.id });
		if (!genre)
			return res.status(404).send(`The genre with the given ID was not found`);

		// Return the Deleted Genre
		res.send(genre);
	}
);

module.exports = router;
