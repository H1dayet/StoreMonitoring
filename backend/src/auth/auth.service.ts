import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  constructor(private readonly users: UsersService) {}

  async login(username: string, password: string) {
    const user = this.users.findByUsername(username);
    if (!user || !user.active || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, this.secret, { expiresIn: '7d' });
    const { passwordHash, ...safe } = user;
    return { token, user: safe };
  }

  verify(token: string) {
    try {
      return jwt.verify(token, this.secret) as { sub: string; username: string; role: string };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
