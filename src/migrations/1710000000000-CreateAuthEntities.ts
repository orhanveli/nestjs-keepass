import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthEntities1710000000000 implements MigrationInterface {
  name = 'CreateAuthEntities1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "passkeys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "credential_id" character varying NOT NULL,
        "public_key" character varying NOT NULL,
        "counter" integer NOT NULL,
        "transports" text NOT NULL,
        "device_type" character varying NOT NULL,
        "backed_up" boolean NOT NULL DEFAULT false,
        "webauthn_user_id" character varying NOT NULL,
        "user_id" uuid,
        CONSTRAINT "UQ_8f4f0f9f8f0f0f0f0f0f0f0f0f" UNIQUE ("credential_id"),
        CONSTRAINT "PK_8f4f0f9f8f0f0f0f0f0f0f0f0f" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "passkeys" ADD CONSTRAINT "FK_8f4f0f9f8f0f0f0f0f0f0f0f0f"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "passkeys" DROP CONSTRAINT "FK_8f4f0f9f8f0f0f0f0f0f0f0f0f"
    `);
    await queryRunner.query(`DROP TABLE "passkeys"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
