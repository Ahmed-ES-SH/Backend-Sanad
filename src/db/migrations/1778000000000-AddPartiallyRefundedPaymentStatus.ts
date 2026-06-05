import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartiallyRefundedPaymentStatus1778000000000 implements MigrationInterface {
  name = 'AddPartiallyRefundedPaymentStatus1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'payments_status_enum'
            AND e.enumlabel = 'partially_refunded'
        ) THEN
          ALTER TYPE "payments_status_enum" ADD VALUE 'partially_refunded';
        END IF;
      END $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL enums do not support dropping a single enum value safely.
  }
}
