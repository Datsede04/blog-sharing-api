import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserID: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new HttpException('Profile  does not exist', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserID,
      followeingId: user.id,
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(
    currentUserID: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new HttpException('Profile  does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserID === user.id) {
      throw new HttpException(
        'You cannot follow your self',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserID,
      followeingId: user.id,
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserID;
      followToCreate.followeingId = user.id;

      await this.followRepository.save(followToCreate);
    }

    return { ...user, following: true };
  }
  async unfollowProfile(
    currentUserID: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new HttpException('Profile  does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserID === user.id) {
      throw new HttpException(
        'You cannot follow your self',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: currentUserID,
      followeingId: user.id,
    });

    return { ...user, following: false };
  }

  buildProfileRespone(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
