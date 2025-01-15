import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { IsNotEmpty } from 'class-validator';

export class FinishPasskeyLoginReqModel {
  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({})
  @IsNotEmpty()
  options: AuthenticationResponseJSON;
}
