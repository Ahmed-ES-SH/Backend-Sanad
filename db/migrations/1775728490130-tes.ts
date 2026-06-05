import { MigrationInterface, QueryRunner } from "typeorm";

export class Tes1775728490130 implements MigrationInterface {
    name = 'Tes1775728490130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_427785468fb7d2733f59e7d7d3"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "user_id" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON "payments" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_427785468fb7d2733f59e7d7d3"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON "payments" ("user_id") `);
    }

}
