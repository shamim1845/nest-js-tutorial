import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() user: User) {
    return this.usersService.updateUser(Number(id), user);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
}
