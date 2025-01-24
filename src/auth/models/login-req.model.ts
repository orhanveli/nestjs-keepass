import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
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
  password?: string;

  @ApiProperty({ required: false, example: '123456' })
  @IsString()
  @IsOptional()
  @Length(6, 6)
  otp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  regular_login?: boolean;
}
