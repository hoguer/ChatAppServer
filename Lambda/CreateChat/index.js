'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.createChat = function(event, context, callback){
    let chat_id = uuid.v1();
    let chat_member_puts = [];
    console.log(event);
    for (let user_email of event.members) {
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
		callback(err, data);
	});
}