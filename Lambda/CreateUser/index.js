'use strict';

var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.createUser = function(event, context, callback){
    // TBD: email address to lower case
    // TBD: check if user already exists
    // TBD: validate email address
	var params = {
		Item : {
			"Email" : event.email
		},
		TableName : process.env.TABLE_NAME
	};
	documentClient.put(params, function(err, data){
		callback(err, data);
	});
}