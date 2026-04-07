import type { MigrationInterface, QueryRunner } from 'typeorm';
import { TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class EnsureUserSessionsConstraints1743512500000 implements MigrationInterface {
  name = 'EnsureUserSessionsConstraints1743512500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userSessionsTable = await queryRunner.getTable('user_sessions');

    if (!userSessionsTable) {
      return;
    }

    if (
      !userSessionsTable.uniques.some(
        (unique) => unique.name === 'UQ_user_sessions_user_id',
      )
    ) {
      await queryRunner.createUniqueConstraint(
        'user_sessions',
        new TableUnique({
          name: 'UQ_user_sessions_user_id',
          columnNames: ['userId'],
        }),
      );
    }

    if (
      !userSessionsTable.uniques.some(
        (unique) => unique.name === 'UQ_user_sessions_refresh_token',
      )
    ) {
      await queryRunner.createUniqueConstraint(
        'user_sessions',
        new TableUnique({
          name: 'UQ_user_sessions_refresh_token',
          columnNames: ['refreshToken'],
        }),
      );
    }

    if (
      !userSessionsTable.indices.some(
        (index) => index.name === 'IDX_user_sessions_expires_at',
      )
    ) {
      await queryRunner.createIndex(
        'user_sessions',
        new TableIndex({
          name: 'IDX_user_sessions_expires_at',
          columnNames: ['expiresAt'],
        }),
      );
    }

    if (
      !userSessionsTable.foreignKeys.some(
        (foreignKey) => foreignKey.name === 'FK_user_sessions_user_id',
      )
    ) {
      await queryRunner.createForeignKey(
        'user_sessions',
        new TableForeignKey({
          name: 'FK_user_sessions_user_id',
          columnNames: ['userId'],
          referencedTableName: 'user',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(): Promise<void> {}
}
