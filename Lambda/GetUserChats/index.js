'use strict';

var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 
	
var response = {
    statusCode: 200,
    headers:{ 'Access-Control-Allow-Origin' : '*' }
};

exports.getUserChats = function(event, context, callback){
    console.log(event);
    let user_email = event.pathParameters['user-email'];
	var params = {
	    ProjectionExpression: 'ChatId',
		TableName : process.env.TABLE_NAME,
        IndexName: 'UserEmail-index',
        KeyConditionExpression: 'UserEmail = :user_email',
        ExpressionAttributeValues: {
            ':user_email': user_email
        }
	};
	documentClient.query(params, function(err, data){
		if(err){
		    callback(err, null);
		}else{
		    if (data.Items.length > 0) {
		        // Have to use query - can't use batchGet because each get is 
		        // for one item, identified by composite key ChatId and 
		        // UserEmail. We are using ChatId to get all UserEmails in each
		        // chat.
        		let chat_member_promises = [ ];
                for (let chat_id_obj of data.Items) {
                    chat_member_promises.push(new Promise(function(resolve, reject) {
                        
                        // BEGIN CHAT MEMBERS PROMISE
                        var params = {
                        	ProjectionExpression: 'UserEmail',
                            TableName : process.env.TABLE_NAME,
                            KeyConditionExpression: 'ChatId = :chat_id',
                            ExpressionAttributeValues: {
                                ':chat_id': chat_id_obj.ChatId
                            }
                        };
                        documentClient.query(params, function(err, data){
                            console.log(data);
                    		if(err){
                    		    reject(err);
                        	}else{
                        	    resolve({
                        	        'ChatId': chat_id_obj.ChatId,
                        		    'Members': data.Items.map(x => x.UserEmail).filter(e => e !== user_email)
                        		});
                        	}
                        });
                        // END CHAT MEMBERS PROMISE
		    
                    }));
                }
                Promise.all(chat_member_promises).then(values => {
                    console.log(values);
                    response.body = JSON.stringify(values);
                    callback(null, response);
                }).catch(error => { 
                    callback(error, null);
                });
		    } else {
		        response.body = JSON.stringify([]);
		        callback(null, response);
		    }
		}
	});
}