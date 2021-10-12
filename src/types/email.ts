export interface SendPasswordResetInput {
  firstName: string;
  login: string;
  token: string;
}

export interface SendActivationInput {
  activationToken: string;
  firstName: string;
}
