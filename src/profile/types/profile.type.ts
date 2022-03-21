import { type } from 'os';
import { userType } from 'src/user/types/user.type';

export type ProfileType = userType & { following: boolean };
