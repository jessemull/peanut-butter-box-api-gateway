export interface User {
  city?: string;
  countryCode?: string;
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

export interface ChangePasswordInput {
  id: string;
  newPassword: string;
  oldPassword: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  city?: string;
  countryCode?: string;
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
  countryCode?: string;
  email: string;
  firstName: string;
  lastName: string;
  primaryPhone?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
}
