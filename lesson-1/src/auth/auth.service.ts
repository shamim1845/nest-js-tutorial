import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ApiResponse, JWT_User_Payload } from 'types';
import { authConfig } from './config/auth.config';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

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
    const user = await this.usersService.findUserByIdOrUserNameOrEmail({
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
    const tokens = await this.generateToken(user);

    return {
      message: 'sucess',
      statusCode: 200,
      data: tokens,
    };
  }

  async refreshToken({ refreshToken }: RefreshTokenDto): Promise<ApiResponse> {
    let userId: number | undefined = undefined;

    // Verify refreshToken
    try {
      const payload = await this.jwtService.verifyAsync<
        Partial<JWT_User_Payload>
      >(refreshToken, this.authConfiguration);
      console.log('payload:=>>>>', payload);

      userId = payload.sub;
    } catch (error) {
      console.log('Error:=>>', error);

      throw new UnauthorizedException('Invalid refreshToken(JWT Error)!');
    }

    // Find the user
    const user = await this.usersService.findUserByIdOrUserNameOrEmail({
      id: userId,
    });

    //  Generate JWT Token
    const tokens = await this.generateToken(user);

    return {
      message: 'sucess',
      statusCode: 200,
      data: tokens,
    };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...(payload ?? {}),
      },
      {
        secret: this.authConfiguration.secret,
        expiresIn: expiresIn,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer,
      },
    );
  }

  private async generateToken(user: User) {
    // Generate Access Token
    const accessToken = await this.signToken<Partial<JWT_User_Payload>>(
      user.id,
      this.authConfiguration.expiresIn,
      {
        email: user.email,
      },
    );

    // Generate Refresh Token
    const refreshToken = await this.signToken(
      user.id,
      this.authConfiguration.refreshTokenExpiresIn,
    );

    return {
      token: accessToken,
      refreshToken,
    };
  }
}
