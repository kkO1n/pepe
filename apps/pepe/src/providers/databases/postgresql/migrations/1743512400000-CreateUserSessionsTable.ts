import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table } from 'typeorm';

export class CreateUserSessionsTable1743512400000 implements MigrationInterface {
  name = 'CreateUserSessionsTable1743512400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUserSessionsTable = await queryRunner.hasTable('user_sessions');

    if (hasUserSessionsTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'user_sessions',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasUserSessionsTable = await queryRunner.hasTable('user_sessions');

    if (!hasUserSessionsTable) {
      return;
    }

    await queryRunner.dropForeignKey(
      'user_sessions',
      'FK_user_sessions_user_id',
    );
    await queryRunner.dropIndex(
      'user_sessions',
      'IDX_user_sessions_expires_at',
    );
    await queryRunner.dropUniqueConstraint(
      'user_sessions',
      'UQ_user_sessions_refresh_token',
    );
    await queryRunner.dropUniqueConstraint(
      'user_sessions',
      'UQ_user_sessions_user_id',
    );
    await queryRunner.dropTable('user_sessions');
  }
}
