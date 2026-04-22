import type { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillUserBalanceTo100001776871000000 implements MigrationInterface {
  name = 'BackfillUserBalanceTo100001776871000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.backfillTable(queryRunner, 'user');
    await this.backfillTable(queryRunner, 'users');
  }

  public async down(): Promise<void> {
    // Intentionally no-op to avoid destructive rollback of user balances.
  }

  private async backfillTable(
    queryRunner: QueryRunner,
    tableName: 'user' | 'users',
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
      `UPDATE "${tableName}" SET "balance" = 10000 WHERE "balance" = 0`,
    );
  }
}
