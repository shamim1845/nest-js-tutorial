import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

// http://localhost:8000/users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(
    @Query('name') name: string,
    @Query('age', new DefaultValuePipe(0), ParseIntPipe) age: number,
    // For pagination
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    console.log({
      name,
      age,
      page,
      limit,
    });

    return this.usersService.getUsers({ name, age, page, limit });
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    // console.log({ id });

    return this.usersService.getUserById(id);
  }

  @Post()
  createUser(@Body() user: CreateUserDto) {
    // console.log(user);
    // console.log(typeof user, user instanceof CreateUserDto);

    return this.usersService.createUser(user);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, user);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
