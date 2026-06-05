import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBasePriceToServices1700000000000 implements MigrationInterface {
  name = 'AddBasePriceToServices1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'services',
      new TableColumn({
        name: 'base_price',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('services', 'base_price');
  }
}
