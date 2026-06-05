import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1743955200000 implements MigrationInterface {
  name = 'CreateServicesTable1743955200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(150) NOT NULL,
        "slug" character varying(160) NOT NULL,
        "short_description" text NOT NULL,
        "long_description" text,
        "icon_url" character varying(255),
        "cover_image_url" character varying(255),
        "is_published" boolean NOT NULL DEFAULT false,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_services_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_services" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IX_services_is_published_order"
      ON "services" ("is_published", "order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IX_services_is_published_order"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
