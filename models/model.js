var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a status
var StatusSchema = new Schema({
	status: String, // what is my current status
	dateAdded : { type: Date, default: Date.now },
});


// export model
module.exports = mongoose.model('Status',StatusSchema);