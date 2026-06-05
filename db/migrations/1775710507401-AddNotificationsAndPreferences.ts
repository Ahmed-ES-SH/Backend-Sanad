import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsAndPreferences1775710507401 implements MigrationInterface {
    name = 'AddNotificationsAndPreferences1775710507401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('ORDER_UPDATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SYSTEM', 'BROADCAST')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'SYSTEM', "title" character varying(255) NOT NULL, "message" text NOT NULL, "data" jsonb, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "is_deleted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_77ee7b06d6f802000c0846f3a5" ON "notifications" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_aef1c7aef3725068e5540f8f00" ON "notifications" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_f12148ce379462ebbb4d06cc13" ON "notifications" ("is_read") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "order_notifications" boolean NOT NULL DEFAULT true, "payment_notifications" boolean NOT NULL DEFAULT true, "system_notifications" boolean NOT NULL DEFAULT true, "email_enabled" boolean NOT NULL DEFAULT true, "push_enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675" UNIQUE ("user_id"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_64c90edc7310c6be7c10c96f67" ON "notification_preferences" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_64c90edc7310c6be7c10c96f67"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f12148ce379462ebbb4d06cc13"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aef1c7aef3725068e5540f8f00"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77ee7b06d6f802000c0846f3a5"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
