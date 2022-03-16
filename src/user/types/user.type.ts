import { UserEntity } from '../user.entity';

export type userType = Omit<UserEntity, 'hashPassword'>;
