import { hash } from 'bcrypt'

const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
  const hashed = await hash(password, saltRounds) as string
  return hashed
}

export default hashPassword
