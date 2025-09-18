import { User } from './models/user.entity';
export declare class UsersService {
    private users;
    private readonly dataDir;
    private readonly dataFile;
    constructor();
    private bootstrapFromDisk;
    private persist;
    findAll(): Omit<User, 'passwordHash'>[];
    findByUsername(username: string): User | undefined;
    create(data: {
        username: string;
        name: string;
        role: 'admin' | 'user';
        active?: boolean;
        password: string;
    }): Omit<User, 'passwordHash'>;
    update(id: string, data: Partial<{
        name: string;
        role: 'admin' | 'user';
        active: boolean;
        password: string;
    }>): Omit<User, 'passwordHash'>;
    remove(id: string): Omit<User, 'passwordHash'>;
}
