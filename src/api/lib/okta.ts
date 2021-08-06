import okta from '@okta/okta-sdk-nodejs'
import { getApiKey } from './secrets-manager'

const getOktaClient = async (): Promise<okta.Client> => {
  const token = await getApiKey()
  const client = new okta.Client({
    orgUrl: 'https://dev-82492334.okta.com',
    token
  })
  return client
}

export default getOktaClient
