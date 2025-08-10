import { Controller, Get } from '@nestjs/common';
import { UserService } from './users.service';

@Controller()
export class UserController {
    constructor(private readonly userService:UserService){}

    @Get("users")
    getUsers ():[object] {
        return this.userService.getUsers()
    }
}