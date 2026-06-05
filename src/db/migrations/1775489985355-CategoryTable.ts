import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoryTable1775489985355 implements MigrationInterface {
  name = 'CategoryTable1775489985355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IX_services_is_published_order"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_22611978869ac4a34bd7a97fc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" RENAME COLUMN "category" TO "category_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(300) NOT NULL, "slug" character varying(350) NOT NULL, "excerpt" text, "content" text NOT NULL, "coverImageUrl" character varying, "tags" text array NOT NULL DEFAULT '{}', "category_id" uuid, "isPublished" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP, "readTimeMinutes" integer NOT NULL DEFAULT '0', "viewsCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug"), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e025eeefcdb2a269c42484ee43" ON "articles" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3fddf7592d60b1d2c483214d87" ON "articles" ("isPublished", "publishedAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(120) NOT NULL, "description" text, "color" character varying(7), "icon" character varying(50), "order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a10aa36cee83153e97161ab26" ON "categories" ("order") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("slug") `,
    );
    await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "category_id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "category_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_1f8d1173481678a035b4a81a4e" ON "services" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61a27c3637cb3232e8e9dc9ffa" ON "services" ("is_published", "order") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1345700580c6c6b17200647bc" ON "projects" ("category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_e025eeefcdb2a269c42484ee43f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_c1345700580c6c6b17200647bcc" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_c1345700580c6c6b17200647bcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_e025eeefcdb2a269c42484ee43f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1345700580c6c6b17200647bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61a27c3637cb3232e8e9dc9ffa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f8d1173481678a035b4a81a4e"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "category_id"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "category_id" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a10aa36cee83153e97161ab26"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3fddf7592d60b1d2c483214d87"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e025eeefcdb2a269c42484ee43"`,
    );
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(
      `ALTER TABLE "projects" RENAME COLUMN "category_id" TO "category"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22611978869ac4a34bd7a97fc1" ON "projects" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IX_services_is_published_order" ON "services" ("is_published", "order") `,
    );
  }
}
