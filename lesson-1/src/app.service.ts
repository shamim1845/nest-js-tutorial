import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'types';

@Injectable()
export class AppService {
  getHomeContent(): ApiResponse {
    return {
      message: 'hello',
      statusCode: 200,
      data: { content: 'Welcome to the NestJS application!' },
    };
  }
}
