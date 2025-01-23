import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('passkeys')
export class PasskeyEntity extends BaseEntity {
  @Column({ unique: true, name: 'credential_id' })
  credentialId: string;

  @Column({ name: 'public_key' })
  publicKey: string;

  @Column()
  counter: number;

  @Column('simple-array')
  transports: string[];

  @Column({ name: 'device_type' })
  deviceType: string;

  @Column({ name: 'backed_up', default: false })
  backedUp: boolean;

  @Column({ name: 'webauthn_user_id' })
  webauthnUserID: string;

  @ManyToOne(() => UserEntity, (user) => user.passkeys)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
