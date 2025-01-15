import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { JwtService } from '@nestjs/jwt';
import { Passkey } from './models/passkey.model';

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    {
      id: 'user1',
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
    },
    {
      id: 'user2',
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
    },
  ];

  private readonly passkeys: Passkey[] = [
    // {
    //   id: 'passkey1',
    //   userId: 'user1',
    //   credentialId: 'credentialId1',
    //   publicKey: 'publicKey1',
    //   counter: 0,
    //   transports: ['internal'],
    // }
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
      const { id, username, email } = user;
      return {
        id,
        username,
        email,
      };
    }
    return null;
  }

  async findUser(id: string): Promise<User> {
    return this.users.find((u) => u.id === id);
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.users.find((u) => u.username === username);
  }

  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getPasskeysByUser(userId: string) {
    return this.passkeys.filter((p) => p.user.id === userId);
  }

  async addPasskey(passkey: Passkey) {
    this.passkeys.push(passkey);
    return passkey;
  }
}
