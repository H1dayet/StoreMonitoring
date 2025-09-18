import { UserRole } from './user.entity';
export declare class CreateUserDto {
    username: string;
    name: string;
    password: string;
    role: UserRole;
    active?: boolean;
}
