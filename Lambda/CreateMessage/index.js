'use strict';

var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 
	
var response = {
    statusCode: 200,
    headers:{ 'Access-Control-Allow-Origin' : '*' }
};

exports.createMessage = function(event, context, callback){
	console.log(event);
	let payload = JSON.parse(event.body);
	let user_email = payload["user_email"];
	let message = payload["message"];
	let createdTime = (new Date()).getTime();
  // TBD: email address to lower case
  // TBD: check if ChatUser already exists (user is in chat)
  // TBD: validate email address
  // Could use CreatedTime and UserEmail as a uniqe Id so Id is unecessary,
  // but then ChatId would need a GSI for retrieving messages by ChatId 
  // Check message length

  //PUSHER
  var Pusher = require('pusher');

	var pusher = new Pusher({
	  appId: process.env.PUSHER_APP_ID,
	  key: process.env.PUSHER_APP_KEY,
	  secret: process.env.PUSHER_APP_SECRET,
	  cluster: 'us2',
	  encrypted: true
	});
	//TBD: get each email address in chat and send to each channel

	pusher.trigger('chat-app', 'test', {
		"UserEmail": user_email,
        "Message": message,
        "CreatedTime": createdTime,
        "ChatId": event.pathParameters['chat-id']
	});
    //ENDPUSHER

	var params = {
		Item : {
		  "ChatId" : event.pathParameters['chat-id'],
		  "Id" : createdTime.toString() + user_email,
			"UserEmail" : user_email,
			"CreatedTime" : createdTime,
			"Message" : message
		},
		TableName : 'Message'
	};
	documentClient.put(params, function(err, data){
		if(err){
		    callback(err, null);
		}else{
			response.body = JSON.stringify({'success': true});
      callback(null, response);
		}
	});
}