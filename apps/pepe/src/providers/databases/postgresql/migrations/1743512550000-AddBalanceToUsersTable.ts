import type { MigrationInterface, QueryRunner } from 'typeorm';
import { TableCheck, TableColumn } from 'typeorm';

export class AddBalanceToUsersTable1743512550000 implements MigrationInterface {
  name = 'AddBalanceToUsersTable1743512550000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('users');

    if (!usersTable) {
      return;
    }

    const hasBalanceColumn = usersTable.columns.some(
      (column) => column.name === 'balance',
    );

    if (!hasBalanceColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'balance',
          type: 'numeric',
          precision: 12,
          scale: 2,
          default: 0,
          isNullable: false,
        }),
      );
    }

    const refreshedUsersTable = await queryRunner.getTable('users');

    if (!refreshedUsersTable) {
      return;
    }

    const hasBalanceCheck = refreshedUsersTable.checks.some(
      (check) => check.name === 'CHK_users_balance_non_negative',
    );

    if (!hasBalanceCheck) {
      await queryRunner.createCheckConstraint(
        'users',
        new TableCheck({
          name: 'CHK_users_balance_non_negative',
          expression: '"balance" >= 0',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('users');

    if (!usersTable) {
      return;
    }

    const balanceCheck = usersTable.checks.find(
      (check) => check.name === 'CHK_users_balance_non_negative',
    );

    if (balanceCheck) {
      await queryRunner.dropCheckConstraint('users', balanceCheck);
    }

    const hasBalanceColumn = usersTable.columns.some(
      (column) => column.name === 'balance',
    );

    if (hasBalanceColumn) {
      await queryRunner.dropColumn('users', 'balance');
    }
  }
}
