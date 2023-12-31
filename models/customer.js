const zod = require("zod");
const validator = require("validator");
const mongoose = require("mongoose");

// Creating Model
const Customer = mongoose.model(
	"Customer",
	new mongoose.Schema({
		isGold: { type: Boolean, default: false },
		name: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50,
		},
		phone: {
			type: String,
			required: true,
		},
	})
);

// Validation Logic
const validateCustomer = (customer) => {
	const Schema = zod.object({
		name: zod.string().min(2),
		isGold: zod.boolean().optional(),
		phone: zod.string().refine(validator.isMobilePhone),
	});

	return Schema.safeParse(customer);
};


module.exports.Customer = Customer;
module.exports.validate = validateCustomer;