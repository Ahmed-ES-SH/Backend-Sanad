import { MigrationInterface, QueryRunner } from "typeorm";

export class CartTables1775651649145 implements MigrationInterface {
    name = 'CartTables1775651649145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cart_id" uuid NOT NULL, "service_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "unit_price" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_613c9dfbe75d21a24e494c44ae" ON "cart_items" ("cart_id", "service_id") `);
        await queryRunner.query(`CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "totalAmount" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2ec1c94a977b940d85a4f498ae" ON "carts" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_854217c28c0e9c61d2c0543925e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_854217c28c0e9c61d2c0543925e"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ec1c94a977b940d85a4f498ae"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_613c9dfbe75d21a24e494c44ae"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
    }

}
