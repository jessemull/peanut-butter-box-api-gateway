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
