const request = require("supertest");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const dayjs = require("dayjs");

describe("/api/returns", () => {
	let server;
	let customerId;
	let movieId;
	let movie;
	let rental;
	let token;

	const exec = () => {
		return request(server)
			.post("/api/returns")
			.set("x-auth-token", token)
			.send({ customerId, movieId });
	};

	beforeEach(async () => {
		server = require("../../index");

		customerId = new mongoose.Types.ObjectId();
		movieId = new mongoose.Types.ObjectId();
		token = new User().generateAuthToken();

		movie = new Movie({
			_id: movieId,
			title: "12345",
			dailyRentalRate: 2,
			genre: {
				name: "12345",
			},
			numberInStock: 10,
		});
		await movie.save();

		rental = new Rental({
			customer: {
				_id: customerId,
				name: "12345",
				phone: "12345",
			},
			movie: {
				_id: movieId,
				title: "12345",
				dailyRentalRate: 2,
			},
		});

		await rental.save();
	});
	afterEach(async () => {
		await server.close();
		await Rental.deleteMany({});
		await Movie.deleteMany({});
	});

	it("should return 401 if client is not logged in", async () => {
		token = "";

		const res = await exec();

		expect(res.status).toBe(401);
	});

	it("should return 400 if customerId is not privided", async () => {
		customerId = "";

		const res = await exec();

		expect(res.status).toBe(400);
	});

	it("should return 400 if movieId is not privided", async () => {
		movieId = "";

		const res = await exec();

		expect(res.status).toBe(400);
	});

	it("should return 404 if no rental found for this customer/movie", async () => {
		await Rental.deleteMany({});

		const res = await exec();

		expect(res.status).toBe(404);
	});

	it("should return 400 if rental already processed", async () => {
		rental.dateReturned = new Date();
		await rental.save();

		const res = await exec();

		expect(res.status).toBe(400);
	});

	it("should return 200 if we have a valid request", async () => {
		const res = await exec();

		expect(res.status).toBe(200);
	});

	it("should set the returnDate if input is valid", async () => {
		await exec();

		const rentalInDb = await Rental.findById(rental._id);

		const diff = new Date() - rentalInDb.dateReturned;

		expect(rentalInDb.dateReturned).toBeDefined();
		expect(diff).toBeLessThan(10 * 1000);
	});

	it("should set the rentalFee if input is valid", async () => {
		rental.dateOut = dayjs().subtract(7, "days");
		await rental.save();

		await exec();

		const rentalInDb = await Rental.findById(rental._id);

		expect(rentalInDb.rentalFee).toBe(14);
	});

	it("should increase the movie stock if input is valid", async () => {
		await exec();

		const movieInDb = await Movie.findById(rental.movie._id);

		expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
	});

	it("should return rental if input is valid", async () => {
		const res = await exec();

		const array = ["dateOut", "dateReturned", "rentalFee", "customer", "movie"];
		expect(Object.keys(res.body)).toEqual(expect.arrayContaining(array));
	});
});
