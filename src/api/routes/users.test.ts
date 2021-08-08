import decodeJWT from 'jwt-decode'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import { createApp } from '../..'
import client from '../../lib/dynamo'
import getOktaClient from '../../lib/okta'
import { Client } from '@okta/okta-sdk-nodejs'

jest.mock('jwt-decode')

jest.mock('../../lib/dynamo')

jest.mock('../../lib/okta')

const mockedGetOktaClient = mocked(getOktaClient)

const mockedJWTDecode = mocked(decodeJWT)

mockedJWTDecode.mockImplementation(() => ({
  sub: 'first.last@domain.com'
}) as never)

describe('/user', () => {
  let app: Express.Application
  beforeAll(() => {
    app = createApp()
  })
  it('GET returns user information', async () => {
    const user = {
      id: 'id',
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      login: 'first.last@domain.com'
    }
    const dbParams = {
      TableName: 'users-table-dev',
      Key: {
        email: 'first.last@domain.com'
      }
    }

    const promise = jest.fn().mockReturnValueOnce(Promise.resolve({ Item: user }))
    client.get = jest.fn().mockImplementation(() => ({ promise }))

    const response = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(user)
    expect(client.get).toHaveBeenCalledWith(dbParams)
  })
  it('GET returns 404 if user is not found', async () => {
    const promise = jest.fn().mockReturnValueOnce(Promise.resolve({}))
    client.get = jest.fn().mockImplementation(() => ({ promise }))

    const response = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(404)
    expect(response.body).toEqual({ error: 'User not found' })
  })
  it('GET catches errors and returns 500', async () => {
    client.get = jest.fn().mockImplementation(() => {
      throw new Error()
    })

    const response = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not fetch user' })
  })
  it('GET returns 401 for invalid JWT', async () => {
    mockedJWTDecode.mockImplementationOnce(() => ({}))
    const noEmail = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    const noAuthHeader = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(401)
    expect(noEmail.body).toEqual({ error: 'Unauthorized' })
    expect(noAuthHeader.body).toEqual({ error: 'Unauthorized' })
  })
  it('POST creates a new user', async () => {
    const user = {
      id: 'id',
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password'
    }
    const dbParams = {
      TableName: 'users-table-dev',
      Item: {
        id: 'id',
        email: 'first.last@domain.com',
        firstName: 'firstName',
        lastName: 'lastName',
        login: 'first.last@domain.com'
      },
      ReturnValues: 'ALL_OLD'
    }

    mockedGetOktaClient.mockResolvedValueOnce({
      createUser: jest.fn().mockResolvedValueOnce(user),
      getUser: jest.fn().mockResolvedValueOnce(null)
    } as unknown as Promise<Client>)

    const promise = jest.fn().mockReturnValueOnce(Promise.resolve())
    client.put = jest.fn().mockImplementation(() => ({ promise }))

    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(user)
    expect(client.put).toHaveBeenCalledWith(dbParams)
  })
  it('POST returns 409 if user already exists', async () => {
    const user = {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password'
    }

    mockedGetOktaClient.mockResolvedValueOnce({
      getUser: jest.fn().mockResolvedValueOnce(true)
    } as unknown as Promise<Client>)

    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(409)
    expect(response.body).toEqual({ error: 'A user with this e-mail already exists' })
  })
  it('POST catches errors and returns 500', async () => {
    const user = {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password'
    }

    mockedGetOktaClient.mockImplementation(() => {
      throw new Error()
    })

    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not create user' })
  })
  it('PUT updates a user', async () => {
    const user = {
      firstName: 'firstName',
      lastName: 'lastName'
    }
    const expected = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    }
    const dbParams = {
      ExpressionAttributeValues: {
        ':f': 'firstName',
        ':l': 'lastName'
      },
      Key: {
        email: 'first.last@domain.com'
      },
      ReturnValues: 'ALL_OLD',
      TableName: 'users-table-dev',
      UpdateExpression: 'set firstName = :f, lastName = :l'
    }

    mockedGetOktaClient.mockResolvedValueOnce({
      getUser: jest.fn().mockResolvedValueOnce({ profile: {}, update: jest.fn() })
    } as unknown as Promise<Client>)

    const promise = jest.fn().mockReturnValueOnce(Promise.resolve())
    client.update = jest.fn().mockImplementation(() => ({ promise }))

    const response = await supertest(app)
      .put('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(expected)
    expect(client.update).toHaveBeenCalledWith(dbParams)
  })
  it('PUT catches errors and returns 500', async () => {
    mockedGetOktaClient.mockImplementation(() => {
      throw new Error()
    })

    const response = await supertest(app)
      .put('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not update user' })
  })
  it('PUT returns 401 for invalid JWT', async () => {
    mockedJWTDecode.mockImplementationOnce(() => ({}))
    const noEmail = await supertest(app)
      .put('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    const noAuthHeader = await supertest(app)
      .put('/users')
      .set('Accept', 'application/json')
      .expect(401)
    expect(noEmail.body).toEqual({ error: 'Unauthorized' })
    expect(noAuthHeader.body).toEqual({ error: 'Unauthorized' })
  })
  it('DELETE removes a user', async () => {
    const dbParams = {
      TableName: 'users-table-dev',
      Key: {
        email: 'first.last@domain.com'
      }
    }

    mockedGetOktaClient.mockResolvedValueOnce({
      getUser: jest.fn().mockResolvedValueOnce({
        deactivate: jest.fn(),
        delete: jest.fn()
      })
    } as unknown as Promise<Client>)

    const promise = jest.fn().mockReturnValueOnce(Promise.resolve())
    client.delete = jest.fn().mockImplementation(() => ({ promise }))

    await supertest(app)
      .delete('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(204)
    expect(client.delete).toHaveBeenCalledWith(dbParams)
  })
  it('DELETE catches errors and returns 500', async () => {
    mockedGetOktaClient.mockImplementation(() => {
      throw new Error()
    })

    const response = await supertest(app)
      .delete('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not delete user' })
  })
  it('DELETE returns 401 for invalid JWT', async () => {
    mockedJWTDecode.mockImplementationOnce(() => ({}))
    const noEmail = await supertest(app)
      .delete('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    const noAuthHeader = await supertest(app)
      .delete('/users')
      .set('Accept', 'application/json')
      .expect(401)
    expect(noEmail.body).toEqual({ error: 'Unauthorized' })
    expect(noAuthHeader.body).toEqual({ error: 'Unauthorized' })
  })
})
