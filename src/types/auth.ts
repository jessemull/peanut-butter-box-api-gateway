export interface JWT {
  sub: string
}

export interface Event {
  authorizationToken: string;
  methodArn: string;
}

export interface Statement {
  Action: string;
  Effect: string;
  Resource: string;
}

export interface AuthResponse {
  context: {
    claims: any; // eslint-disable-line
  };
  principalId: string;
  policyDocument?:{
    Version: string;
    Statement: Array<Statement>;
  }
}

export interface Activation {
  activationToken: string;
  password: string;
}

export interface Reset {
  resetToken: string;
  password: string;
}

export interface AuthnResponse {
  stateToken: string;
}

export interface PasswordResetResponse {
  _embedded: {
    user: {
      profile: {
        login: string;
      }
    }
  }
}
