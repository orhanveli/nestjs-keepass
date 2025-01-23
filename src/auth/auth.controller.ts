import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginReqModel } from './models/login-req.model';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { webAuthN } from './constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StartPasskeyLoginReqModel } from './models/start-passkey-login-req.model';
import { FinishPasskeyLoginReqModel } from './models/finish-passkey-login-req.model';
import { FinishPasskeyRegisterReqModel } from './models/finish-passkey-register-req.model';
import { LoginResModel } from './models/login-res.model';
import { StartPasskeyRegisterResModel } from './models/start-passkey-register-res.model';
import { StartPasskeyLoginResModel } from './models/start-passkey-login-res.model';
import { FinishPasskeyLoginResModel } from './models/finish-passkey-login-res.model';

const authNRegisterOptions: Record<
  string,
  PublicKeyCredentialCreationOptionsJSON
> = {};
const authNLoginOptions: Record<string, PublicKeyCredentialRequestOptionsJSON> =
  {};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginReqModel): Promise<LoginResModel> {
    const user = await this.authService.findUserByUsername(body.username);
    if (!user) {
      throw new HttpException(
        { error: 'invalid ussernam' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const passkeys = await this.authService.getPasskeysByUser(user.id);
    if (!passkeys || passkeys.length === 0) {
      if (!body.regular_login) {
        return {
          passkey_enabled: false,
        };
      }
      if (!body.password) {
        throw new HttpException(
          { error: 'password is required' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const validateResult = await this.authService.validateUser(
        body.username,
        body.password,
      );
      if (!validateResult) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      const loginResult = await this.authService.login(user);
      return {
        passkey_enabled: false,
        access_token: loginResult.access_token,
        user,
      };
    }

    return {
      passkey_enabled: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Express.Request & { user: UserEntity }) {
    const reqUser = request.user;

    return {
      user: reqUser,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('passkey/register-start')
  async authnRegisterStart(
    @Req() request: Express.Request & { user: UserEntity },
  ): Promise<StartPasskeyRegisterResModel> {
    const user = request.user;
    const userPasskeys = await this.authService.getPasskeysByUser(user.id);
    const options = await generateRegistrationOptions({
      rpName: webAuthN.rpName,
      rpID: webAuthN.rpID,
      userID: Buffer.from(user.id),
      userName: user.username,
      userDisplayName: user.username,
      attestationType: 'none',
      excludeCredentials: userPasskeys.map((passkey) => ({
        id: passkey.id,
        type: 'public-key',
        transports: ['internal'],
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
        requireResidentKey: false,
      },
      // supportedAlgorithmIDs: [],
    });
    authNRegisterOptions[user.id] = options;
    return { options };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('passkey/register-finish')
  async authnRegisterFinish(
    @Body() body: FinishPasskeyRegisterReqModel,
    @Req() request: Express.Request & { user: UserEntity },
  ): Promise<FinishPasskeyLoginResModel> {
    const user = request.user;

    const currentOptions = authNRegisterOptions[user.id];

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: webAuthN.origin,
        expectedRPID: webAuthN.rpID,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { verified: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { verified } = verification;

    if (verified) {
      const publicKeyBase64 = Buffer.from(
        verification.registrationInfo.credential.publicKey,
      ).toString('base64');

      await this.authService.addPasskey({
        user,
        backedUp: verification.registrationInfo?.credentialBackedUp ?? false,
        counter: verification.registrationInfo?.credential?.counter ?? 0,
        transports: (verification.registrationInfo?.credential?.transports ??
          []) as AuthenticatorTransportFuture[],
        id: verification.registrationInfo?.credential.id,
        publicKey: publicKeyBase64,
        deviceType:
          verification.registrationInfo?.credentialDeviceType ?? 'singleDevice',
        webauthnUserID: user.id,
      });
      const login = await this.authService.login(user);
      return {
        verified,
        access_token: login.access_token,
        user,
      };
    }

    return {
      verified,
      access_token: null,
      user: null,
    };
  }

  @Post('passkey/login-start')
  async authnLoginStart(
    @Body() body: StartPasskeyLoginReqModel,
  ): Promise<StartPasskeyLoginResModel> {
    const user = await this.authService.findUserByUsername(body.username);
    if (!user) {
      throw new HttpException(
        { error: 'User not found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPasskeys = await this.authService.getPasskeysByUser(user.id);
    if (!userPasskeys || userPasskeys.length === 0) {
      throw new HttpException(
        { error: 'No passkeys found for user' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: webAuthN.rpID,
      allowCredentials: userPasskeys.map((passkey) => ({
        id: passkey.id,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      })),
    });
    authNLoginOptions[user.id] = options;
    return { options };
  }

  @Post('passkey/login-finish')
  async authnLoginFinish(
    @Body() body: FinishPasskeyLoginReqModel,
  ): Promise<FinishPasskeyLoginResModel> {
    const user = await this.authService.findUserByUsername(body.username);
    if (!user) {
      throw new HttpException(
        { error: 'User not found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPasskeys = await this.authService.getPasskeysByUser(user.id);
    const passkey = userPasskeys.find((pk) => pk.id === body.options.id);
    const currentOptions = authNLoginOptions[user.id];

    let verification;
    try {
      const publicKeyBuffer = Buffer.from(passkey.publicKey, 'base64');

      verification = await verifyAuthenticationResponse({
        response: body.options,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: webAuthN.origin,
        expectedRPID: webAuthN.rpID,
        credential: {
          id: passkey.id,
          publicKey: publicKeyBuffer,
          counter: passkey.counter,
          transports: passkey.transports as AuthenticatorTransportFuture[],
        },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }

    const { verified } = verification;

    if (verified) {
      // Update the authenticator's counter
      passkey.counter = verification.authenticationInfo.newCounter;
      const loginResult = await this.authService.login(user);
      return {
        verified,
        access_token: loginResult.access_token,
        user,
      };
    }

    throw new HttpException(
      { verified: false, error: 'Authentication failed' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
