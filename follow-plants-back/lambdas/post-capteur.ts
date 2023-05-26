import * as cdk from 'aws-cdk-lib';
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: any, context: any) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    try {
        body = await dynamo.put(JSON.parse(event.body)).promise();
    } catch (err) {
        statusCode = '400';
        // body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};