import { ApiProperty } from '@nestjs/swagger';
import {
  AuthenticationExtensionsClientOutputs,
  AuthenticatorAttachment,
  AuthenticatorAttestationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FinishPasskeyRegisterReqModel implements RegistrationResponseJSON {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  rawId: string;

  @ApiProperty()
  @IsNotEmpty()
  response: AuthenticatorAttestationResponseJSON;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  authenticatorAttachment?: AuthenticatorAttachment;

  @ApiProperty()
  @IsNotEmpty()
  clientExtensionResults: AuthenticationExtensionsClientOutputs;

  @ApiProperty()
  @IsNotEmpty()
  type: PublicKeyCredentialType;
}

// export class FinishPasskeyRegisterReqModel
//   implements AuthenticatorAttestationResponseJSON
// {
//   @ApiProperty()
//   @IsNotEmpty()
//   clientDataJSON: string;

//   @ApiProperty()
//   @IsNotEmpty()
//   attestationObject: string;

//   @ApiProperty({
//     required: false,
//   })
//   @IsOptional()
//   authenticatorData?: string;

//   @ApiProperty({
//     isArray: true,
//     required: false,
//   })
//   @IsOptional()
//   transports?: AuthenticatorTransportFuture[];

//   @ApiProperty({
//     required: false,
//   })
//   @IsOptional()
//   publicKeyAlgorithm?: number;

//   @ApiProperty({
//     required: false,
//   })
//   @IsOptional()
//   publicKey?: string;
// }
