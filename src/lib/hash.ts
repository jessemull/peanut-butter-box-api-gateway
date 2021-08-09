import bcrypt from 'bcrypt'

const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
  const hashed: string = await bcrypt.hash(password, saltRounds)
  return hashed
}

export default hashPassword
