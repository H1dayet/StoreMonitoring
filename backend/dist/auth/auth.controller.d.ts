import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(body: {
        username: string;
        password: string;
    }): Promise<{
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
}
