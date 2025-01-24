import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasskeyEntity } from './entities/passkey.entity';

@Injectable()
export class PasskeyService {
  constructor(
    @InjectRepository(PasskeyEntity)
    private readonly passkeyRepository: Repository<PasskeyEntity>,
  ) {}

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

  async findByCredentialId(credentialId: string): Promise<PasskeyEntity> {
    return this.passkeyRepository.findOne({
      where: { credentialId },
      relations: ['user'],
    });
  }

  async updateCounter(
    passkey: PasskeyEntity,
    newCounter: number,
  ): Promise<void> {
    passkey.counter = newCounter;
    await this.passkeyRepository.save(passkey);
  }
}
