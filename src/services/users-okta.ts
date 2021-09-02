import { AppUser, User } from '@okta/okta-sdk-nodejs'
import getOktaClient from '../lib/okta'
import { AuthnResponse, OktaUserInput, PasswordResetResponse } from '../types'

const oktaURL = process.env.OKTA_DOMAIN as string

export const createUser = async ({ email, firstName, lastName }: OktaUserInput): Promise<AppUser> => {
  const client = await getOktaClient()
  const url = `${oktaURL}/api/v1/users?activate=false`
  const request = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profile: {
        email,
        firstName,
        lastName,
        login: email
      }
    })
  }
  const data = await client.http.http(url, request)
  const response = await data.json() as AppUser
  return response
}

export const deleteUser = async (email: string): Promise<User> => {
  const client = await getOktaClient()
  const user = await client.getUser(email)
  await user.deactivate()
  await user.delete()
  return user
}

export const doesUserExist = async (email: string): Promise<AppUser | null> => {
  const client = await getOktaClient()
  const validateURL = `${oktaURL}/api/v1/users?limit=200&filter=profile.email+eq+%22${encodeURIComponent(email)}%22`
  const validateRequest = {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const data = await client.http.http(validateURL, validateRequest)
  const users = await data.json() as [AppUser] | []
  return users[0] || null
}

export const getActivationToken = async (id: string): Promise<string> => {
  const client = await getOktaClient()
  const activationURL = `${oktaURL}/api/v1/users/${id}/lifecycle/activate?sendEmail=false`
  const activationRequest = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const data = await client.http.http(activationURL, activationRequest)
  const response = await data.json() as { activationToken: string }
  return response.activationToken
}

export const getResetToken = async (id: string): Promise<string> => {
  const client = await getOktaClient()
  const resetURL = `${oktaURL}/api/v1/users/${id}/lifecycle/reset_password?sendEmail=false`
  const resetRequest = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const resetData = await client.http.http(resetURL, resetRequest)
  const reset = await resetData.json() as { resetPasswordUrl: string }
  const tokenRegex = /[^/]+$/
  const match = reset.resetPasswordUrl.match(tokenRegex)
  const token = match && match.length > 0 ? match[0] : ''
  return token
}

export const getStateToken = async (token: string): Promise<string> => {
  const oktaClient = await getOktaClient()
  const url = `${oktaURL}/api/v1/authn`
  const request = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token
    })
  }
  const data = await oktaClient.http.http(url, request)
  const response = await data.json() as AuthnResponse
  return response.stateToken
}

export const resetPassword = async (newPassword: string, stateToken: string): Promise<{ email: string, response: PasswordResetResponse }> => {
  const client = await getOktaClient()
  const urlPasswordReset = `${oktaURL}/api/v1/authn/credentials/reset_password`
  const requestPasswordReset = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newPassword,
      stateToken
    })
  }
  const data = await client.http.http(urlPasswordReset, requestPasswordReset)
  const response = await data.json() as PasswordResetResponse
  const email = response._embedded.user.profile.login
  return { email, response }
}

export const updateUser = async ({ city, email, firstName, lastName, primaryPhone, state, streetAddress, zipCode }: OktaUserInput): Promise<User> => {
  const client = await getOktaClient()
  const user = await client.getUser(email)
  user.profile.firstName = firstName
  user.profile.lastName = lastName
  if (city) {
    user.profile.city = city
  }
  if (primaryPhone) {
    user.profile.primaryPhone = primaryPhone
  }
  if (state) {
    user.profile.state = state
  }
  if (streetAddress) {
    user.profile.streetAddress = streetAddress
  }
  if (zipCode) {
    user.profile.zipCode = zipCode
  }
  await user.update()
  return user
}
