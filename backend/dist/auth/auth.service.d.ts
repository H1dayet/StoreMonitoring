import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly users;
    private readonly secret;
    constructor(users: UsersService);
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            name: string;
            role: import("../users/models/user.entity").UserRole;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    verify(token: string): {
        sub: string;
        username: string;
        role: string;
    };
}
