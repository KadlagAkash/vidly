const zod = require("zod");
const mongoose = require("mongoose");

// Defining Schema
const rentalSchema = new mongoose.Schema({
	customer: {
		type: new mongoose.Schema({
			name: {
				type: String,
				required: true,
				minlength: 5,
				maxlength: 50,
			},
			isGold: {
				type: Boolean,
				default: false,
			},
			phone: {
				type: String,
				required: true,
				minlength: 5,
				maxlength: 50,
			},
		}),
		required: true,
	},
	movie: {
		type: new mongoose.Schema({
			title: {
				type: String,
				required: true,
				trim: true,
				minlength: 3,
				maxlength: 255,
			},
			dailyRentalRate: {
				type: Number,
				required: true,
				min: 0,
				max: 255,
			},
		}),
		required: true,
	},
	dateOut: {
		type: Date,
		required: true,
		default: Date.now,
	},
	dateReturned: {
		type: Date,
	},
	rentalFee: {
		type: Number,
		min: 0,
	},
});

// Creating Model
const Rental = mongoose.model("Rental", rentalSchema);

// Validation Logic
const validateRental = (rental) => {
	const Schema = zod.object({
		customerId: zod.string().refine((val) => val.length === 24, {
			message: "Invalid customerId",
		}),
		movieId: zod.string().refine((val) => val.length === 24, {
			message: "Invalid movieId",
		}),
	});

	return Schema.safeParse(rental);
};

exports.Rental = Rental;
exports.validate = validateRental;
