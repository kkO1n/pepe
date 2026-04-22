import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SetUserBalanceDefaultTo100001776870000000 implements MigrationInterface {
  name = 'SetUserBalanceDefaultTo100001776870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.setBalanceDefault(queryRunner, 'user', 10000);
    await this.setBalanceDefault(queryRunner, 'users', 10000);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.setBalanceDefault(queryRunner, 'user', 0);
    await this.setBalanceDefault(queryRunner, 'users', 0);
  }

  private async setBalanceDefault(
    queryRunner: QueryRunner,
    tableName: 'user' | 'users',
    defaultValue: number,
  ): Promise<void> {
    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    const table = await queryRunner.getTable(tableName);

    if (!table) {
      return;
    }

    const hasBalanceColumn = table.columns.some(
      (column) => column.name === 'balance',
    );

    if (!hasBalanceColumn) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "balance" SET DEFAULT ${defaultValue}`,
    );
  }
}
