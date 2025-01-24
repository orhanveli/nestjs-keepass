import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotpTable1710000000001 implements MigrationInterface {
  name = 'AddTotpTable1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add totp_enabled column to users table
    await queryRunner.query(`
      ALTER TABLE "users" ADD "totp_enabled" boolean NOT NULL DEFAULT false
    `);

    // Create totp_records table
    await queryRunner.query(`
      CREATE TABLE "totp_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "secret_key" character varying NOT NULL,
        "verified" boolean NOT NULL DEFAULT false,
        "backup_codes" text,
        "last_used_at" TIMESTAMP,
        "user_id" uuid,
        CONSTRAINT "PK_totp_records" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "totp_records" ADD CONSTRAINT "FK_totp_records_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "totp_records" DROP CONSTRAINT "FK_totp_records_user"
    `);
    await queryRunner.query(`DROP TABLE "totp_records"`);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "totp_enabled"
    `);
  }
}
