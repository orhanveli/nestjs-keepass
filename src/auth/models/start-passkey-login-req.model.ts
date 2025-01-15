import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StartPasskeyLoginReqModel {
  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  username: string;
}
