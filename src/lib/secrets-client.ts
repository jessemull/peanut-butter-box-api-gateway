import AWS from 'aws-sdk'

const client = new AWS.SecretsManager({
  region: process.env.AWS_REGION
})

export default client
