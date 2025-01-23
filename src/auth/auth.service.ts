/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { PasskeyEntity } from './entities/passkey.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PasskeyEntity)
    private readonly passkeyRepository: Repository<PasskeyEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<UserEntity, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password'],
    });

    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['passkeys'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['passkeys'],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async login(
    user: Omit<UserEntity, 'password'>,
  ): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getPasskeysByUser(userId: string): Promise<PasskeyEntity[]> {
    return this.passkeyRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async addPasskey(passkey: Partial<PasskeyEntity>): Promise<PasskeyEntity> {
    const newPasskey = this.passkeyRepository.create(passkey);
    return this.passkeyRepository.save(newPasskey);
  }
}
