const express = require("express");
const mongoose = require("mongoose");
const { Rental, validate } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const authorization = require('../middleware/authorization');
const admin = require('../middleware/admin');

const router = express.Router();

/* ----- Read ----- */
router.get("/", authorization, async (req, res) => {
	const rentals = await Rental.find().sort({ dateOut: -1 });
	// Return the rentals
	res.send(rentals);
});

router.get("/:id", authorization, async (req, res) => {
	const rental = await Rental.findById(req.params.id);
	if (!rental)
		return res.status(404).send(`The rental with the given ID was not found`);

	// Return the rental
	res.send(rental);
});

/* ----- Write ----- */
router.post("/", authorization,  async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Validate the Input
		const input = validate(req.body);
		if (!input.success) throw new Error(input.error.issues[0].message);

		// Validating Customer
		const customer = await Customer.findById(req.body.customerId).session(
			session
		);
		if (!customer) throw new Error("Invalid customer");

		// Validating Movie
		const movie = await Movie.findById(req.body.movieId).session(session);
		if (!movie) throw new Error("Invalid movie");

		if (movie.numberInStock === 0) throw new Error("Movie not in stock.");

		// Add Rental
		let rental = new Rental({
			customer: {
				_id: customer._id,
				name: customer.name,
				phone: customer.phone,
			},
			movie: {
				_id: movie._id,
				title: movie.title,
				dailyRentalRate: movie.dailyRentalRate,
			},
		});

		await rental.save({ session });

		// Update Movie
		await Movie.updateOne(
			{ _id: movie._id },
			{ $inc: { numberInStock: -1 } },
			{ session }
		);

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		// Return the New Rental
		res.send(rental);
	} catch (error) {
		console.error("Error in creating a rental:", error.message);

		// Rollback the transaction
		await session.abortTransaction();
		session.endSession();

		res.status(500).send("Internal Server Error:");
	}
});

/* ----- Delete ----- */
router.delete("/:id", [authorization, admin], async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const rental = await Rental.findOneAndDelete({
			_id: req.params.id,
		}).session(session);

		if (!rental)
			return res.status(404).send(`The rental with the given ID was not found`);

		// Increment numberInStock for the associated movie
		await Movie.updateOne(
			{ _id: rental.movie._id },
			{ $inc: { numberInStock: 1 } },
			{ session }
		);

		await session.commitTransaction();
		session.endSession();

		// Return the Deleted Rental
		res.send(rental);
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		console.error("Error in deleting a rental:", error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
