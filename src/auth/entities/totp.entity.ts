import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('totp_records')
export class TotpEntity extends BaseEntity {
  @Column({ name: 'secret_key' })
  secretKey: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ name: 'backup_codes', type: 'simple-array', nullable: true })
  backupCodes: string[];

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.totpRecords)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
