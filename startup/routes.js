const express = require('express');
const genresRoutes = require("../routes/genres");
const customersRoutes = require("../routes/customers");
const moviesRoutes = require("../routes/movies");
const rentalsRoutes = require("../routes/rentals");
const usersRoutes = require("../routes/users");
const authRoutes = require("../routes/auth");
const returnRoutes = require("../routes/returns");
const error = require("../middleware/error");

module.exports = (app) => {
	app.use(express.json());
	app.use("/api/genres", genresRoutes);
	app.use("/api/customers", customersRoutes);
	app.use("/api/movies", moviesRoutes);
	app.use("/api/rentals", rentalsRoutes);
	app.use("/api/users", usersRoutes);
	app.use("/api/auth", authRoutes);
	app.use("/api/returns",returnRoutes);
	app.use(error);
};
