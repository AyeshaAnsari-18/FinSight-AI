import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const requestPath = request.route?.path ?? request.path ?? request.url;

    if (
      typeof requestPath === 'string' &&
      (requestPath === 'metrics' || requestPath.startsWith('/metrics'))
    ) {
      return true;
    }

    return super.canActivate(context);
  }
}
