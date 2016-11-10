var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//Twilio
var twilio = require('twilio');

// Geocoder
var geocoder = require('geocoder');

// our db model1
var Status = require("../models/status.js");

// our db model2
var Meal = require("../models/meal.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {
  
  var jsonData = {
  	'name': 'node-express-twilio-sms',
  	'api-status':'OK',
    'instructions': "Text your meal to (678)-264-6646",
    'format': 'type,rating,place,location'
  }

  // respond with json data
  res.json(jsonData)
});

// Twilio callback route
// This gets called every time an incoming message is received
router.post('/twilio-callback', function(req,res){

  // there's lots contained in the body
  console.log(req.body);

  // the actual message is contained in req.body.Body
  var incomingMsg = req.body.Body;
  console.log(incomingMsg);

  var incomingNum = req.body.From;

  // now, let's save it to our Database
  var msgToSave = {
    status: incomingMsg,
    from: incomingNum
  }

  var status = new Status(msgToSave)

  status.save(function(err,data){
    // set up the twilio response
    var twilioResp = new twilio.TwimlResponse();
    if(err){
      // respond to user
      twilioResp.sms('Oops! We couldn\'t save status --> ' + incomingMsg);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());      
    }
    else {
      // respond to user
      twilioResp.sms('Successfully saved status! --> ' + incomingMsg);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());     
    }
  })


})

// a different twilio callback, this one for our meals
router.post('/twilio-callback2', function(req,res){

  // there's lots contained in the body
  console.log(req.body);

  // the actual message is contained in req.body.Body
  var incomingMsg = req.body.Body;
  console.log(incomingMsg);


  // we don't want to save the entire body as one thing
  // we want to break it up into fields based on a structure of:
  // breakfast,3,My House,Brooklyn
  // which maps to:
  // type: breakfast
  // rating: 3,
  // place: My House
  // location: Brooklyn

  // the first thing we need to do is separate the big string into individual parts
  // we can do that by splitting at the commas
  var msgArray =  incomingMsg.split(',');

  // now it would look like [breakfast,3,My House,Brooklyn]
  console.log(msgArray);

  // now we can get the value
  var type = msgArray[0];
  var rating = msgArray[1];
  var place = msgArray[2];
  var location = msgArray[3];

  // set up our data
  var mealToSave = {
    type: type,
    rating: rating,
    place: place
  }

  // now, let's geocode the location
  geocoder.geocode(location, function (err,data) {

    // set up the twilio response
    var twilioResp = new twilio.TwimlResponse();

    // if we get an error, or don't have any results, respond back with error
    if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
      // respond to user
      twilioResp.sms('Oops! We couldn\'t save meal.. couldn\'t find location -->'  + location);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());      
    }

    // else, let's pull put the lat lon from the results
    var lon = data.results[0].geometry.location.lng;
    var lat = data.results[0].geometry.location.lat;

    // now, let's add this to our animal object from above
    mealToSave.location = {
      geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
      name: data.results[0].formatted_address // the location name
    }

      var meal = new Meal(mealToSave)

      meal.save(function(err,data){
        if(err){
          // respond to user
          twilioResp.sms('Oops! We couldn\'t save meal --> ' + incomingMsg);
          // respond to twilio
          res.set('Content-Type', 'text/xml');
          res.send(twilioResp.toString());      
        }
        else {
          // respond to user
          twilioResp.sms('Successfully saved meal! --> ' + incomingMsg);
          // respond to twilio
          res.set('Content-Type', 'text/xml');
          res.send(twilioResp.toString());    
        }
      })


  });


})

router.get('/api/get',function(req,res){

  Status.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);      
    }
    else {
      var jsonData = {
        status: "OK",
        statuses: data
      }
      res.json(jsonData);   
    }    
  })

})

router.get('/api/get/latest',function(req,res){

  Status.find().sort('-dateAdded').exec(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);      
    }
    else {
      var jsonData = {
        status: "OK",
        status: data[0]
      }
      res.send(data[0].status);   
    }    
  })

})


router.get('/api/get/meals',function(req,res){

  Meal.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);      
    }
    else {
      var jsonData = {
        status: "OK",
        meals: data
      }
      res.json(jsonData);   
    }    
  })

})



module.exports = router;