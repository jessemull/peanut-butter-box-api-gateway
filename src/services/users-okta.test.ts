import { mocked } from 'ts-jest/utils'
import getOktaClient from '../lib/okta'
import { createUser, deleteUser, doesUserExist, getActivationToken, getResetToken, getStateToken, resetPassword, updateUser } from './users-okta'

jest.mock('../lib/okta')

const getClient = mocked(getOktaClient, true)

describe('okta user service', () => {
  it('should get state token', async () => {
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce({ stateToken: 'stateToken' }) }) } }) as any)
    const response = await getStateToken('token')
    expect(response).toEqual('stateToken')
  })
  it('should reset password', async () => {
    const reset = { _embedded: { user: { profile: { login: 'email' } } } }
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(reset) }) } }) as any)
    const response = await resetPassword('password', 'token')
    expect(response).toEqual({ email: 'email', response: reset })
  })
  it('should check if user exists', async () => {
    const users = [{ id: 'id' }]
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(users) }) } }) as any)
    const response = await doesUserExist('email')
    expect(response).toEqual(users[0])
  })
  it('should return null if user does not exist', async () => {
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce([]) }) } }) as any)
    const response = await doesUserExist('email')
    expect(response).toEqual(null)
  })
  it('should get reset token', async () => {
    const token = 'token'
    const reset = { resetPasswordUrl: `https://mydomain.com/${token}` }
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(reset) }) } }) as any)
    const response = await getResetToken('id')
    expect(response).toEqual(token)
  })
  it('should return empty string if token URL is invalid', async () => {
    const reset = { resetPasswordUrl: '/' }
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(reset) }) } }) as any)
    const response = await getResetToken('id')
    expect(response).toEqual('')
  })
  it('should create user', async () => {
    const user = {
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last'
    }
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(user) }) } }) as any)
    const response = await createUser(user)
    expect(response).toEqual(user)
  })
  it('should get activation token', async () => {
    const token = {
      activationToken: 'token'
    }
    getClient.mockImplementationOnce(() => Promise.resolve({ http: { http: jest.fn().mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(token) }) } }) as any)
    const response = await getActivationToken('id')
    expect(response).toEqual(token.activationToken)
  })
  it('should update user', async () => {
    const input = {
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last'
    }
    const mockedResponse = {
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last',
      profile: {},
      update: jest.fn()
    }
    const expected = {
      ...mockedResponse,
      profile: {
        firstName: 'first',
        lastName: 'last'
      }
    }
    getClient.mockImplementationOnce(() => Promise.resolve({ getUser: jest.fn().mockResolvedValueOnce(mockedResponse) }) as any)
    const response = await updateUser(input)
    expect(response).toEqual(expected)
    expect(mockedResponse.update).toHaveBeenCalledTimes(1)
  })
  it('should delete user', async () => {
    const email = 'first.last@domain.com'
    const user = {
      deactivate: jest.fn(),
      delete: jest.fn()
    }
    getClient.mockImplementationOnce(() => Promise.resolve({ getUser: jest.fn().mockResolvedValueOnce(user) }) as any)
    await deleteUser(email)
    expect(user.deactivate).toHaveBeenCalledTimes(1)
    expect(user.delete).toHaveBeenCalledTimes(1)
  })
})
