import { User } from './user.model';

export class FinishPasskeyLoginResModel {
  verified: boolean;
  access_token: string;
  user: Omit<User, 'password'>;
}
