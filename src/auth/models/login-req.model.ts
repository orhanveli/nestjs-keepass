import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginReqModel {
  @ApiProperty({
    example: 'user@domain.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'user123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  regular_login?: boolean;
}
