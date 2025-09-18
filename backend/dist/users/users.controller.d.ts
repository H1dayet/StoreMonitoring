import { UsersService } from './users.service';
import { CreateUserDto } from './models/create-user.dto';
import { UpdateUserDto } from './models/update-user.dto';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    findAll(): Omit<import("./models/user.entity").User, "passwordHash">[];
    create(dto: CreateUserDto): Omit<import("./models/user.entity").User, "passwordHash">;
    update(id: string, dto: UpdateUserDto): Omit<import("./models/user.entity").User, "passwordHash">;
    remove(id: string): Omit<import("./models/user.entity").User, "passwordHash">;
}
