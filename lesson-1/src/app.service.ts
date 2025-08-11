import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHomeContent(): object {
    return {
      msg: 'hello',
      status: 500,
    };
  }
}
