export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  password?: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  email: string;
  firstName: string;
  lastName: string;
}

export interface OktaUserInput {
  email: string;
  firstName: string;
  lastName: string;
}
