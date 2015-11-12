var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a meal
var MealSchema = new Schema({
	type: String, // what type of meal? breakfast? lunch? diner?
	rating: Number, // 1-5 rating
	place: String, // name of place
	location: {
		geo: { type: [Number], index: { type: '2dsphere', sparse: true } },
		name: String 
	}, // where'd we get it?
	dateAdded : { type: Date, default: Date.now },
});


// export model
module.exports = mongoose.model('Meal',MealSchema);