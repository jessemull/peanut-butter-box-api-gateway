export interface MessageInput {
  date: string;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

export interface Message {
  date: string;
  firstName: string;
  lastName: string;
  message: string;
}

export interface Messages {
  email: string;
  messages: Array<Message>;
}
