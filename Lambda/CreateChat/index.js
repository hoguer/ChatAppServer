'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 
	
var response = {
    statusCode: 200,
    headers:{ 'Access-Control-Allow-Origin' : '*' }
};

exports.createChat = function(event, context, callback){
    let chat_id = uuid.v1();
    let chat_member_puts = [];
    let payload = JSON.parse(event.body);
    console.log(event);
    for (let user_email of payload.members) {
        chat_member_puts.push({
            PutRequest: {
                Item: {
                    ChatId: chat_id,
                    UserEmail: user_email
                }
            }
        })
    }
    let params = {
        RequestItems: {
            [process.env.TABLE_NAME] : chat_member_puts
        }
    };

	documentClient.batchWrite(params, function(err, data){
	    if(err){
		    callback(err, null);
		}else{
			response.body = JSON.stringify({'ChatId': chat_id});
            callback(null, response);
		}
	});
}