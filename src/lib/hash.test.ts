import hashPassword from './hash'

describe('hashPassword', () => {
  it('should hash password', async () => {
    const password = 'password'
    const hashed = await hashPassword(password)
    expect(hashed).not.toEqual(password)
  })
})
