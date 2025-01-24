import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  logger = new Logger(UserMiddleware.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.authService.findUser(payload.sub);

      if (user) {
        req['user'] = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    } catch (err) {
      this.logger.error(err);
    }

    next();
  }
}
