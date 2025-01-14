import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return !!request?.user;
  }

  handleRequest(err, user, info) {
    this.logger.debug(info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
