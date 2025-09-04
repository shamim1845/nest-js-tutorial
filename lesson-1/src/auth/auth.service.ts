import { forwardRef, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ApiResponse } from 'types';
import { authConfig } from './config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  isAuthenticated: boolean = false;

  login({ email, password }: { email: string; password: string }): ApiResponse {
    // const user = this.usersService.users.find(
    //   (user) => user.email === email && user.password === password,
    // );

    // if (!user) {
    //   return {
    //     message: 'failed',
    //     statusCode: 400,
    //     error: 'User not found!',
    //   };
    // }

    const secretKey = this.authConfiguration.secretKey;
    console.log({ secretKey });

    this.isAuthenticated = true;
    return {
      message: 'sucess',
      statusCode: 200,
      data: { user: 'user', token: 'my_secret_token' },
    };
  }
}
