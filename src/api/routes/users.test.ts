import bodyParser from 'body-parser'
import express, { Application, NextFunction, Request } from 'express'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import routes from '..'
import { DynamoDBUserService, EmailService, OktaUserService } from '../../services'
import { AppUser, User } from '@okta/okta-sdk-nodejs'

jest.mock('../../services')

const { createUser: createDynamoUser, deleteUser: deleteDynamoUser, getUser, resetUserPassword, updateUser: updateDynamoUser, verifyUser } = mocked(DynamoDBUserService)
const { deleteUser, doesUserExist, createUser, getActivationToken, getResetToken, getStateToken, resetPassword, updateUser } = mocked(OktaUserService)
const { sendActivation, sendPasswordReset } = mocked(EmailService)

const sub = 'first.last@domain.com'

const authorizationContextMiddleware = (req: Request & { event: any }, res: Response, next: NextFunction): void => {
  req.event = { requestContext: { authorizer: { email: sub } } }
  next()
}

const getApp = (useAuth = true): Application => {
  const app = express()
  if (useAuth) {
    app.use(authorizationContextMiddleware as any)
  }
  app.use(bodyParser.json({ strict: false }))
  app.use(routes())
  return app
}

describe('/users', () => {
  let app: Application
  beforeAll(() => {
    app = getApp()
  })
  it('GET returns user information', async () => {
    const user = {
      id: 'id',
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      login: 'first.last@domain.com'
    }
    getUser.mockResolvedValueOnce(user)
    const response = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(user)
    expect(getUser).toHaveBeenCalledWith(user.email)
  })
  it('GET returns 404 if user is not found', async () => {
    getUser.mockResolvedValueOnce(null)
    const response = await supertest(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(404)
    expect(response.body).toEqual({ error: 'User not found' })
  })
  it('GET catches errors and returns 500', async () => {
    getUser.mockImplementationOnce(() => {
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
    const response = await supertest(getApp(false))
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    expect(response.body).toEqual({ error: 'Invalid user JWT' })
  })
  it('POST creates a new user', async () => {
    const user = {
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName'
    }
    const userWithId = {
      id: 'id',
      ...user
    }
    createUser.mockResolvedValueOnce(userWithId as unknown as AppUser)
    doesUserExist.mockResolvedValueOnce(null)
    getActivationToken.mockResolvedValueOnce('token')
    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(userWithId)
    expect(createUser).toHaveBeenCalledWith(user)
    expect(doesUserExist).toHaveBeenCalledWith(user.email)
    expect(getActivationToken).toHaveBeenCalledWith('id')
    expect(sendActivation).toHaveBeenLastCalledWith('token')
    expect(createDynamoUser).toHaveBeenCalledWith(userWithId)
  })
  it('POST returns 409 if user already exists', async () => {
    doesUserExist.mockResolvedValueOnce({} as AppUser)
    const user = {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password'
    }
    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(409)
    expect(response.body).toEqual({ error: 'A user with this e-mail already exists!' })
  })
  it('POST catches errors and returns 500', async () => {
    doesUserExist.mockImplementationOnce(() => {
      throw new Error()
    })
    const user = {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password'
    }
    const response = await supertest(app)
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Sign up failed!' })
  })
  it('POST /verify verifies user', async () => {
    const passwordResponse = {
      _embedded: {
        user: {
          profile: {
            login: 'login'
          }
        }
      }
    }
    const verify = {
      activationToken: 'activationToken',
      password: 'password'
    }
    getStateToken.mockResolvedValueOnce('stateToken')
    resetPassword.mockResolvedValueOnce({ email: sub, response: passwordResponse })
    const response = await supertest(app)
      .post('/users/verify')
      .send(verify)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(passwordResponse)
    expect(getStateToken).toHaveBeenCalledWith('activationToken')
    expect(resetPassword).toHaveBeenCalledWith(verify.password, 'stateToken')
    expect(verifyUser).toHaveBeenLastCalledWith(sub, verify.password)
  })
  it('POST /verify catches errors and returns 500', async () => {
    const verify = {
      activationToken: 'activationToken',
      password: 'password'
    }
    const response = await supertest(app)
      .post('/users/verify')
      .send(verify)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not verify user' })
  })
  it('POST /reset resets user password', async () => {
    const passwordResponse = {
      _embedded: {
        user: {
          profile: {
            login: 'login'
          }
        }
      }
    }
    const reset = {
      resetToken: 'resetToken',
      password: 'password'
    }
    getStateToken.mockResolvedValueOnce('stateToken')
    resetPassword.mockResolvedValueOnce({ email: sub, response: passwordResponse })
    const response = await supertest(app)
      .post('/users/reset')
      .send(reset)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(passwordResponse)
    expect(getStateToken).toHaveBeenCalledWith('activationToken')
    expect(resetPassword).toHaveBeenCalledWith(reset.password, 'stateToken')
    expect(resetUserPassword).toHaveBeenLastCalledWith(sub, reset.password)
  })
  it('POST /reset catches errors and returns 500', async () => {
    const reset = {
      resetToken: 'activationToken',
      password: 'password'
    }
    const response = await supertest(app)
      .post('/users/reset')
      .send(reset)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not reset user password' })
  })
  it('POST /request/reset requests a user password reset via e-mail', async () => {
    const user = {
      id: 'id'
    }
    const resetRequest = {
      email: sub
    }
    doesUserExist.mockResolvedValueOnce(user as AppUser)
    getResetToken.mockResolvedValueOnce('resetToken')
    await supertest(app)
      .post('/users/request/reset')
      .send(resetRequest)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(doesUserExist).toHaveBeenCalledWith(sub)
    expect(getResetToken).toHaveBeenCalledWith(user.id)
    expect(sendPasswordReset).toHaveBeenLastCalledWith('resetToken')
  })
  it('POST /request/reset returns 404 if the user does not exist', async () => {
    const resetRequest = {
      email: sub
    }
    doesUserExist.mockResolvedValueOnce(null)
    const response = await supertest(app)
      .post('/users/request/reset')
      .send(resetRequest)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(404)
    expect(response.body).toEqual({ error: 'A user with this e-mail does not exist' })
  })
  it('POST /request/reset catches errors and returns 500', async () => {
    const resetRequest = {
      email: sub
    }
    doesUserExist.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .post('/users/request/reset')
      .send(resetRequest)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not reset user password' })
  })
  it('PUT updates a user', async () => {
    const user = {
      firstName: 'firstName',
      lastName: 'lastName'
    }
    const userWithEmail = {
      email: sub,
      ...user
    }
    updateUser.mockResolvedValueOnce(userWithEmail as unknown as User)
    const response = await supertest(app)
      .put('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(userWithEmail)
    expect(updateUser).toHaveBeenCalledWith(userWithEmail)
    expect(updateDynamoUser).toHaveBeenCalledWith(userWithEmail)
  })
  it('PUT catches errors and returns 500', async () => {
    const user = {
      firstName: 'firstName',
      lastName: 'lastName'
    }
    updateUser.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .put('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not update user' })
  })
  it('PUT returns 401 for invalid JWT', async () => {
    const user = {
      firstName: 'firstName',
      lastName: 'lastName'
    }
    const response = await supertest(getApp(false))
      .put('/users')
      .send(user)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    expect(response.body).toEqual({ error: 'Invalid user JWT' })
  })
  it('DELETE removes a user', async () => {
    await supertest(app)
      .delete('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(204)
    expect(deleteUser).toHaveBeenCalledWith(sub)
    expect(deleteDynamoUser).toHaveBeenCalledWith(sub)
  })
  it('DELETE catches errors and returns 500', async () => {
    deleteUser.mockImplementationOnce(() => {
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
    const response = await supertest(getApp(false))
      .delete('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(401)
    expect(response.body).toEqual({ error: 'Invalid user JWT' })
  })
})
