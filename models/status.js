var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a status
var StatusSchema = new Schema({
	status: String, // what is the current status
	from: String, // who is it from
	dateAdded : { type: Date, default: Date.now },
});


// export model
module.exports = mongoose.model('Status',StatusSchema);