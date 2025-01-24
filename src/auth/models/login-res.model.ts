import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.model';

export class LoginResModel {
  @ApiProperty()
  access_token?: string;

  @ApiProperty()
  user?: User;

  @ApiProperty()
  passkey_enabled: boolean;

  @ApiProperty()
  totp_enabled: boolean;
}
