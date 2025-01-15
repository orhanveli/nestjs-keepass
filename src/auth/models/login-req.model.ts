import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginReqModel {
  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsOptional()
  regular_login?: boolean;

  @ApiProperty({
    example: 'user123',
    required: false,
  })
  @IsOptional()
  password?: string;
}
