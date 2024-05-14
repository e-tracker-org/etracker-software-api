const dbConfig = require('../../config/mongodb.config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tenant = require('./tenant.model.js')(mongoose);
db.user = require('./user.model.js')(mongoose);
db.transaction = require('./transaction.model.js')(mongoose);
db.files = require('./files.model.js')(mongoose);
db.properties = require('./properties.model.js')(mongoose);
db.tenantDefault = require('./tenantDefault.js')(mongoose);
db.history = require('./history.model.js')(mongoose);

module.exports = db;
