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
} from '@simplewebauthn/server';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './models/user.model';
import { webAuthN } from './constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StartPasskeyLoginReqModel } from './models/start-passkey-login-req.model';
import { FinishPasskeyLoginReqModel } from './models/finish-passkey-login-req.model';
import { FinishPasskeyRegisterReqModel } from './models/finish-passkey-register-req.model';
import { LoginResModel } from './models/login-res.model';
import { StartPasskeyRegisterResModel } from './models/start-passkey-register-res.model';

const authNRegisterOptions: Map<
  string,
  PublicKeyCredentialCreationOptionsJSON
> = new Map();
const authNLoginOptions: Map<string, PublicKeyCredentialRequestOptionsJSON> =
  new Map();

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
  async me(@Req() request: Express.Request & { user: User }) {
    const reqUser = request.user;

    return {
      user: reqUser,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('passkey/register-start')
  async authnRegisterStart(
    @Req() request: Express.Request & { user: User },
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
    @Req() request: Express.Request & { user: User },
  ) {
    const user = request.user;

    const currentOptions = authNRegisterOptions[user.id];

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: webAuthN.rpID,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }

    const { verified } = verification;

    if (verified) {
      await this.authService.addPasskey({
        user,
        backedUp: verification.registrationInfo?.credentialBackedUp ?? false,
        counter: verification.registrationInfo?.credential?.counter ?? 0,
        transports: verification.registrationInfo?.credential?.transports ?? [],
        id: verification.registrationInfo?.credential.id,
        publicKey: verification.registrationInfo?.credential?.publicKey,
        deviceType:
          verification.registrationInfo?.credentialDeviceType ?? 'singleDevice',
        webauthnUserID: user.id,
      });
    }

    return {
      verified,
    };
  }

  @Post('passkey/login-start')
  async authnLoginStart(@Body() body: StartPasskeyLoginReqModel) {
    const user = await this.authService.findUserByUsername(body.username);
    if (!user) {
      throw new HttpException(
        { error: 'User not found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPasskeys = await this.authService.getPasskeysByUser(user.id);
    const options = await generateAuthenticationOptions({
      rpID: webAuthN.rpID,
      // Require users to use a previously-registered authenticator
      allowCredentials: userPasskeys.map((passkey) => ({
        id: passkey.id,
        transports: passkey.transports,
      })),
    });
    authNLoginOptions[user.id] = options;
    return options;
  }

  @Post('passkey/login-finish')
  async authnLoginFinish(@Body() body: FinishPasskeyLoginReqModel) {
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
      verification = await verifyAuthenticationResponse({
        response: body.options,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: webAuthN.rpID,
        credential: {
          id: passkey.id,
          publicKey: passkey.publicKey,
          counter: passkey.counter,
          transports: passkey.transports,
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
        access_token: loginResult.access_token,
        user,
      };
    }

    throw new HttpException(
      { error: 'Authentication failed' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
