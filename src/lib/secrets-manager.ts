import logger from './logger'
import client from './secrets-client'

const secretsCache: { [key: string]: string } = {}

const getSecret = async (secretId: string): Promise<string | undefined> => {
  if (secretsCache[secretId]) {
    return secretsCache[secretId]
  }
  try {
    const data = await client.getSecretValue({ SecretId: secretId }).promise()
    if (data.SecretString) {
      const parsed = JSON.parse(data.SecretString) as { [secretId: string]: string }
      const secret = parsed[secretId]
      secretsCache[secretId] = secret
      return secret
    }
  } catch (error) {
    logger.error(error)
  }
  return undefined
}

export {
  getSecret
}
