import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.model';

export class LoginResModel {
  @ApiProperty()
  access_token?: string;

  @ApiProperty()
  user?: Omit<User, 'password'>;

  @ApiProperty()
  passkey_enabled: boolean;
}
