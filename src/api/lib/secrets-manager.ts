import AWS from 'aws-sdk'
import logger from './logger'

const secretId: string = process.env.API_KEY_SECRET_NAME as string

const client = new AWS.SecretsManager({
  region: process.env.AWS_REGION
})

let apiKey: string

const getApiKey = async (): Promise<string | undefined> => {
  if (apiKey) {
    return apiKey
  }
  try {
    const data = await client.getSecretValue({ SecretId: secretId }).promise()
    if (data.SecretString) {
      const parsed = JSON.parse(data.SecretString) as { [secretId: string]: string }
      apiKey = parsed[secretId]
      return apiKey
    }
  } catch (error) {
    logger.error(error)
  }
  return undefined
}

export {
  getApiKey
}
