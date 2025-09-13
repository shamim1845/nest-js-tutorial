/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { authConfig } from '../config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from 'src/constants/constants';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    private readonly jwtService: JwtService,

    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Read isPublic Metadata
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 1. Extract Request From Execution Context
    const request: Request = context.switchToHttp().getRequest();

    // 2. Extract Token From The Request Header
    const token = request?.headers?.authorization?.split(' ')[1];

    // 3. Validate Token And Provide / Deny Access
    if (!token) {
      throw new UnauthorizedException(
        'You are not allowed to access this resource.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.authConfiguration,
      );

      request[REQUEST_USER_KEY] = payload;

      return true;
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException(
        'You are not allowed to access this resource(Invalid Token).',
      );
    }
  }
}
