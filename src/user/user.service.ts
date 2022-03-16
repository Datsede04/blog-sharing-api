import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRETE } from 'src/config';
import { UserResponesInterface } from './types/userRespone.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcryptjs';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    readonly userReposioty: Repository<UserEntity>,
  ) {}
  async createUser(createUSerDto: CreateUserDto) {
    const userByEmail = await this.userReposioty.findOne({
      email: createUSerDto.email,
    });
    const userByUsername = await this.userReposioty.findOne({
      username: createUSerDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username aare taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUSerDto);
    return await this.userReposioty.save(newUser);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userReposioty.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userReposioty.findOne(
      {
        email: loginUserDto.email,
      },
      { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
    );

    if (!user) {
      throw new HttpException(
        'Credentail are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Credentails are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    delete user.password;
    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userReposioty.findOne(id);
  }

  generateJwt(user: UserEntity) {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRETE,
    );
  }
  buildUserResponse(user: UserEntity): UserResponesInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
