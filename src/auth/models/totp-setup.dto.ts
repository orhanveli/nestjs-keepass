import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TotpSetupResponseDto {
  @ApiProperty()
  secretKey: string;

  @ApiProperty()
  uri: string;

  @ApiProperty({ type: [String] })
  backupCodes: string[];
}

export class TotpVerifyDto {
  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string;
}
