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
    // Add your custom authentication logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    this.logger.log(info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
