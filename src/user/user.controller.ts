import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from './decorators/user.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UpdateUserDto } from './dto/update.dto';
import { AuthGuard } from './guards/auth.guard';
import { ExpressRequest } from './types/expressRequest.interface';
import { UserResponesInterface } from './types/userRespone.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUSerDto: CreateUserDto,
  ): Promise<UserResponesInterface> {
    const user = await this.userService.createUser(createUSerDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('user/login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body('user') loginUserdto: LoginUserDto,
  ): Promise<UserResponesInterface> {
    const user = await this.userService.login(loginUserdto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: any): Promise<UserResponesInterface> {
    console.log(user);
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateDto: UpdateUserDto,
  ): Promise<UserResponesInterface> {
    const user = await this.userService.updateUser(currentUserId, updateDto);

    return this.userService.buildUserResponse(user);
  }
}
