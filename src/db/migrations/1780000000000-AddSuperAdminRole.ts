import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminRole1780000000000 implements MigrationInterface {
  name = 'AddSuperAdminRole1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'users_role_enum'
            AND e.enumlabel = 'super_admin'
        ) THEN
          ALTER TYPE "users_role_enum" ADD VALUE 'super_admin';
        END IF;
      END $$;
    `);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    // PostgreSQL enums do not support dropping a single enum value safely.
  }
}
