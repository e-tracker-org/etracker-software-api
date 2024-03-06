const dbConfig = require("../../config/mongodb.config");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tenant = require("./tenant.model.js")(mongoose);
db.user = require("./user.model.js")(mongoose);

module.exports = db;
