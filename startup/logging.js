const { createLogger, format, transports } = require("winston");
require("winston-mongodb");
require("express-async-errors");

const logger = createLogger({
	level: "info",
	format: format.combine(format.simple()),
	transports: [
		new transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		}),
		new transports.File({ filename: "logfile.log" }),
	],
	exceptionHandlers: [
		new transports.Console({
			format: format.combine(format.colorize(), format.json()),
		}),
		new transports.File({
			filename: "exceptions.log",
			format: format.json(),
		}),
	],
	rejectionHandlers: [
		new transports.Console({
			format: format.combine(format.colorize(), format.json()),
		}),
		new transports.File({ filename: "rejections.log" }),
	],
});

// MongoDB Transport 
const transportOptions = async () => {
	const MongoClient = require("mongodb").MongoClient;
	const url = "your-db-url/vidly";

	const client = new MongoClient(url);
	await client.connect();
	const transportOptions = {
		db: await Promise.resolve(client),
		collection: "log",
		level: "info",
	};
	logger.add(new transports.MongoDB(transportOptions));
};
transportOptions();

module.exports = logger;
