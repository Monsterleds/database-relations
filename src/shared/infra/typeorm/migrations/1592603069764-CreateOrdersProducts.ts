import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateOrdersProducts1592603069764
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders_products',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: true,
            precision: 7,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('orders_products', [
      new TableForeignKey({
        name: 'fk_ordersproducts_product',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),

      new TableForeignKey({
        name: 'fk_ordersproducts_order',
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'orders_products',
      'fk_ordersproducts_product',
    );

    await queryRunner.dropForeignKey(
      'orders_products',
      'fk_ordersproducts_order',
    );

    await queryRunner.dropTable('orders_products');
  }
}
