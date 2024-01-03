const express = require("express");
const zod = require("zod");
const { Rental } = require("../models/rental");
const authorization = require("../middleware/authorization");
const { Movie } = require("../models/movie");

const router = express.Router();

router.post("/", authorization, async (req, res) => {
	// Validate the Input
	const input = validateReturn(req.body);
	if (!input.success)
		return res.status(400).send(input.error.issues[0].message);

	// Validating Rental
	const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

	if (!rental) res.status(404).send("Rental not found.");

	if (rental.dateReturned) res.status(400).send("Rental alredy processed.");

	rental.return();

	await rental.save();

	await Movie.updateOne(
		{ _id: rental.movie._id },
		{
			$inc: { numberInStock: 1 },
		}
	);

	return res.send(rental);
});

// Validation Logic
const validateReturn = (req) => {
	const Schema = zod.object({
		customerId: zod.string().refine((val) => val.length === 24, {
			message: "Invalid customerId",
		}),
		movieId: zod.string().refine((val) => val.length === 24, {
			message: "Invalid movieId",
		}),
	});

	return Schema.safeParse(req);
};

module.exports = router;
