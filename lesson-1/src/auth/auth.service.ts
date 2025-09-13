import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ApiResponse } from 'types';
import { authConfig } from './config/auth.config';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    @Inject(UsersService)
    private readonly usersService: UsersService,

    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,

    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<ApiResponse> {
    // hash the password
    const hashedPassword = await this.hashingProvider.hashPassword(
      createUserDto.password,
    );

    // Store hash in your password DB
    createUserDto.password = hashedPassword;

    return await this.usersService.createUser(createUserDto);
  }

  async login({ email, password }: LoginDto): Promise<ApiResponse> {
    const user = await this.usersService.findUserByUserNameOrEmail({
      email: email,
    });

    const validPassword = await this.hashingProvider.comparePassword(
      password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid Password!');
    }

    //  Generate JWT Token
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.authConfiguration.secret,
        expiresIn: this.authConfiguration.expiresIn,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer,
      },
    );

    user.password = '';

    return {
      message: 'sucess',
      statusCode: 200,
      data: { user: user, token: token },
    };
  }
}
