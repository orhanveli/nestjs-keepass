import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    { id: 'user1', username: 'admin', password: 'admin123' },
    { id: 'user2', username: 'user', password: 'user123' },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      const { id, username } = user;
      return {
        id,
        username,
      };
    }
    return null;
  }

  async findUser(id: string): Promise<User> {
    return this.users.find((u) => u.id === id);
  }

  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
