import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginReqModel {
  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'user123',
  })
  @IsNotEmpty()
  password: string;
}
