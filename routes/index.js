var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//Twilio
var twilio = require('twilio');

// our db model
var Status = require("../models/model.js");

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
    'instructions': "Text your status to (646)-846-8769"
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



module.exports = router;