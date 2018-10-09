'use strict';

var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.getChatMessages = function(event, context, callback){
	console.log(event);
	var params = {
	    ProjectionExpression: 'UserEmail,CreatedTime,Message',
		TableName : process.env.TABLE_NAME,
        KeyConditionExpression: 'ChatId = :chat_id',
        ExpressionAttributeValues: {
            ':chat_id': event.pathParameters['chat-id']
        }
	};
	documentClient.query(params, function(err, data){
	    console.log(data);
		if(err){
		    callback(err, null);
		}else{
			var response = {
        		statusCode: 200,
    			headers:{ 'Access-Control-Allow-Origin' : '*' },
        		body: JSON.stringify(data.Items)
    		};
		    callback(null, response)
        }
	});
}