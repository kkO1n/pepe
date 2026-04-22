import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAvatarTable1776872000000 implements MigrationInterface {
  name = 'CreateAvatarTable1776872000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAvatarTable = await queryRunner.hasTable('avatar');

    if (!hasAvatarTable) {
      await queryRunner.createTable(
        new Table({
          name: 'avatar',
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
              name: 'url',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'isPrimary',
              type: 'boolean',
              isNullable: false,
              default: false,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
            {
              name: 'deletedAt',
              type: 'timestamp',
              isNullable: true,
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('avatar');

    if (!table) {
      return;
    }

    const hasUserIdIndex = table.indices.some(
      (index) => index.name === 'idx_avatar_user_id',
    );

    if (!hasUserIdIndex) {
      await queryRunner.createIndex(
        'avatar',
        new TableIndex({
          name: 'idx_avatar_user_id',
          columnNames: ['userId'],
        }),
      );
    }

    const hasForeignKey = table.foreignKeys.some(
      (foreignKey) =>
        foreignKey.columnNames.length === 1 &&
        foreignKey.columnNames[0] === 'userId',
    );

    if (!hasForeignKey) {
      const referencedTable = (await queryRunner.hasTable('user'))
        ? 'user'
        : (await queryRunner.hasTable('users'))
          ? 'users'
          : null;

      if (referencedTable) {
        await queryRunner.createForeignKey(
          'avatar',
          new TableForeignKey({
            name: 'FK_avatar_user_id',
            columnNames: ['userId'],
            referencedTableName: referencedTable,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAvatarTable = await queryRunner.hasTable('avatar');

    if (!hasAvatarTable) {
      return;
    }

    const table = await queryRunner.getTable('avatar');

    if (!table) {
      return;
    }

    const userForeignKey = table.foreignKeys.find(
      (foreignKey) => foreignKey.name === 'FK_avatar_user_id',
    );

    if (userForeignKey) {
      await queryRunner.dropForeignKey('avatar', userForeignKey);
    }

    const userIdIndex = table.indices.find(
      (index) => index.name === 'idx_avatar_user_id',
    );

    if (userIdIndex) {
      await queryRunner.dropIndex('avatar', userIdIndex);
    }

    await queryRunner.dropTable('avatar');
  }
}
