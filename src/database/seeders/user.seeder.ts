import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { PasswordUtil } from '../../common/utils/password.util';

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultUser();
  }

  private async seedDefaultUser() {
    const defaultUser = {
      email: 'user@domain.com',
      username: 'user',
      password: 'user123',
    };

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: defaultUser.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create({
          ...defaultUser,
          password: PasswordUtil.encrypt(defaultUser.password),
        });

        await this.userRepository.save(user);
        this.logger.log('Default user created successfully');
      } else {
        this.logger.log('Default user already exists');
      }
    } catch (error) {
      this.logger.error('Error seeding default user:', error);
    }
  }
}
