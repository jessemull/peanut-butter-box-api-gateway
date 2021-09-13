import AWS from 'aws-sdk'

const client = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true })

export default client
