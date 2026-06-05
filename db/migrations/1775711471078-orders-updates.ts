import { MigrationInterface, QueryRunner } from "typeorm";

export class OrdersUpdates1775711471078 implements MigrationInterface {
    name = 'OrdersUpdates1775711471078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_updates_author_enum" AS ENUM('user', 'admin', 'system')`);
        await queryRunner.query(`CREATE TABLE "order_updates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "author" "public"."order_updates_author_enum" NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_87e5bdcf124d4940a1324ab8086" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_209ba61bcf9955db6d9bd469a8" ON "order_updates" ("order_id", "created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."service_orders_status_enum" AS ENUM('pending', 'paid', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "service_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "service_id" uuid NOT NULL, "payment_id" uuid, "status" "public"."service_orders_status_enum" NOT NULL DEFAULT 'pending', "amount" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'usd', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ec41659cd0dffdfba18050df8d0" UNIQUE ("payment_id"), CONSTRAINT "REL_ec41659cd0dffdfba18050df8d" UNIQUE ("payment_id"), CONSTRAINT "PK_914aa74962ee83b10614ea2095d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b8fe29acc71691af512c6eebb6" ON "service_orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_4f52ddf98e5cd7c06332d7a8d1" ON "service_orders" ("service_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7680498e0f1a03041ef58ac9d" ON "service_orders" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "order_updates" ADD CONSTRAINT "FK_6dc2fe0b030e2ce882c5c6cff1e" FOREIGN KEY ("order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_orders" ADD CONSTRAINT "FK_f7680498e0f1a03041ef58ac9d8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_orders" ADD CONSTRAINT "FK_4f52ddf98e5cd7c06332d7a8d1c" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_orders" ADD CONSTRAINT "FK_ec41659cd0dffdfba18050df8d0" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_orders" DROP CONSTRAINT "FK_ec41659cd0dffdfba18050df8d0"`);
        await queryRunner.query(`ALTER TABLE "service_orders" DROP CONSTRAINT "FK_4f52ddf98e5cd7c06332d7a8d1c"`);
        await queryRunner.query(`ALTER TABLE "service_orders" DROP CONSTRAINT "FK_f7680498e0f1a03041ef58ac9d8"`);
        await queryRunner.query(`ALTER TABLE "order_updates" DROP CONSTRAINT "FK_6dc2fe0b030e2ce882c5c6cff1e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7680498e0f1a03041ef58ac9d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f52ddf98e5cd7c06332d7a8d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8fe29acc71691af512c6eebb6"`);
        await queryRunner.query(`DROP TABLE "service_orders"`);
        await queryRunner.query(`DROP TYPE "public"."service_orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_209ba61bcf9955db6d9bd469a8"`);
        await queryRunner.query(`DROP TABLE "order_updates"`);
        await queryRunner.query(`DROP TYPE "public"."order_updates_author_enum"`);
    }

}
