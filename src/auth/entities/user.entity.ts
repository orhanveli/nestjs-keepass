import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { PasskeyEntity } from './passkey.entity';
import { TotpEntity } from './totp.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'totp_enabled', default: false })
  totpEnabled: boolean;

  @OneToMany(() => PasskeyEntity, (passkey) => passkey.user)
  passkeys: PasskeyEntity[];

  @OneToMany(() => TotpEntity, (totp) => totp.user)
  totpRecords: TotpEntity[];
}
