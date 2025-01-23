/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { PasskeyEntity } from './entities/passkey.entity';
import { PasswordUtil } from '../common/utils/password.util';

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
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password'],
    });

    if (user && PasswordUtil.verify(password, user.password)) {
      return user;
    }
    return null;
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<UserEntity> {
    const encryptedPassword = PasswordUtil.encrypt(password);
    const user = this.userRepository.create({
      username,
      email,
      password: encryptedPassword,
    });
    return this.userRepository.save(user);
  }

  async findUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['passkeys'],
    });
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['passkeys'],
    });
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }
    return user;
  }

  async login(
    user: Omit<UserEntity, 'password'>,
  ): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
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
