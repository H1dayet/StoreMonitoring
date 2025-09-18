import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from './user.entity';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(['admin', 'user'])
  role!: UserRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
