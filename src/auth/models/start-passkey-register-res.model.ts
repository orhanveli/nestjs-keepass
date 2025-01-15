import { ApiProperty } from '@nestjs/swagger';

export class StartPasskeyRegisterResModel {
  @ApiProperty()
  options: PublicKeyCredentialCreationOptionsJSON;
}
