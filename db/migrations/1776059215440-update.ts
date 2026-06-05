import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1776059215440 implements MigrationInterface {
    name = 'Update1776059215440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64c90edc7310c6be7c10c96f67"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675" UNIQUE ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_64c90edc7310c6be7c10c96f67" ON "notification_preferences" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_64c90edc7310c6be7c10c96f67"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675" UNIQUE ("user_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_64c90edc7310c6be7c10c96f67" ON "notification_preferences" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `);
    }

}
