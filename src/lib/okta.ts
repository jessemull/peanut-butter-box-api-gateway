import { Client } from '@okta/okta-sdk-nodejs'
import { getSecret } from './secrets-manager'

let oktaClient: Client

const getOktaClient = async (): Promise<Client> => {
  if (!oktaClient) {
    const token = await getSecret(process.env.API_KEY_SECRET_NAME as string)
    oktaClient = new Client({
      orgUrl: process.env.OKTA_DOMAIN,
      token
    })
  }
  return oktaClient
}

export default getOktaClient
