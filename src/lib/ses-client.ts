import AWS from 'aws-sdk'

const client = new AWS.SES({ apiVersion: '2010-12-01' })

export default client
