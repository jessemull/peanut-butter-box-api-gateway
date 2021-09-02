export interface User {
  city?: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  password?: string;
  primaryPhone?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  city?: string;
  email: string;
  firstName: string;
  lastName: string;
  primaryPhone?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
}

export interface OktaUserInput {
  city?: string;
  email: string;
  firstName: string;
  lastName: string;
  primaryPhone?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
}
