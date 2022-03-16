import { userType } from './user.type';

export interface UserResponesInterface {
  user: userType & { token: string };
}
