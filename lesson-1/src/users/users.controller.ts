import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import type { User } from './users.service';

// http://localhost:8000/users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query() { name, age }: { name: string; age: string }): object {
    return this.usersService.getUsers({ name, age });
  }

  @Get(':id')
  getUserById(@Param('id') id: string): object {
    return this.usersService.getUserById(Number(id));
  }

  @Post()
  createUser(@Body() user: User) {
    return this.usersService.createUser(user);
  }
}
