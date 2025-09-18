import { UserRole } from './user.entity';
export declare class UpdateUserDto {
    name?: string;
    role?: UserRole;
    active?: boolean;
    password?: string;
}
