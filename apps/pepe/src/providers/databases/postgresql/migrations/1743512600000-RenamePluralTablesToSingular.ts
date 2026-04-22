import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePluralTablesToSingular1743512600000 implements MigrationInterface {
  name = 'RenamePluralTablesToSingular1743512600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      (await queryRunner.hasTable('users')) &&
      !(await queryRunner.hasTable('user'))
    ) {
      await queryRunner.renameTable('users', 'user');
    }

    if (
      (await queryRunner.hasTable('avatars')) &&
      !(await queryRunner.hasTable('avatar'))
    ) {
      await queryRunner.renameTable('avatars', 'avatar');
    }

    if (
      (await queryRunner.hasTable('user_sessions')) &&
      !(await queryRunner.hasTable('user_session'))
    ) {
      await queryRunner.renameTable('user_sessions', 'user_session');
    }

    await this.renameIndexIfExists(
      queryRunner,
      'idx_users_login_age_id',
      'idx_user_login_age_id',
    );
    await this.renameIndexIfExists(
      queryRunner,
      'idx_avatars_user_id',
      'idx_avatar_user_id',
    );
    await this.renameIndexIfExists(
      queryRunner,
      'IDX_user_sessions_expires_at',
      'IDX_user_session_expires_at',
    );

    if (await queryRunner.hasTable('user')) {
      await this.renameConstraintIfExists(
        queryRunner,
        'user',
        'CHK_users_balance_non_negative',
        'CHK_user_balance_non_negative',
      );
    }

    if (await queryRunner.hasTable('user_session')) {
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'UQ_user_sessions_user_id',
        'UQ_user_session_user_id',
      );
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'UQ_user_sessions_refresh_token',
        'UQ_user_session_refresh_token',
      );
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'FK_user_sessions_user_id',
        'FK_user_session_user_id',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user')) {
      await this.renameConstraintIfExists(
        queryRunner,
        'user',
        'CHK_user_balance_non_negative',
        'CHK_users_balance_non_negative',
      );
    }

    if (await queryRunner.hasTable('user_session')) {
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'UQ_user_session_user_id',
        'UQ_user_sessions_user_id',
      );
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'UQ_user_session_refresh_token',
        'UQ_user_sessions_refresh_token',
      );
      await this.renameConstraintIfExists(
        queryRunner,
        'user_session',
        'FK_user_session_user_id',
        'FK_user_sessions_user_id',
      );
    }

    await this.renameIndexIfExists(
      queryRunner,
      'idx_user_login_age_id',
      'idx_users_login_age_id',
    );
    await this.renameIndexIfExists(
      queryRunner,
      'idx_avatar_user_id',
      'idx_avatars_user_id',
    );
    await this.renameIndexIfExists(
      queryRunner,
      'IDX_user_session_expires_at',
      'IDX_user_sessions_expires_at',
    );

    if (
      (await queryRunner.hasTable('user_session')) &&
      !(await queryRunner.hasTable('user_sessions'))
    ) {
      await queryRunner.renameTable('user_session', 'user_sessions');
    }

    if (
      (await queryRunner.hasTable('avatar')) &&
      !(await queryRunner.hasTable('avatars'))
    ) {
      await queryRunner.renameTable('avatar', 'avatars');
    }

    if (
      (await queryRunner.hasTable('user')) &&
      !(await queryRunner.hasTable('users'))
    ) {
      await queryRunner.renameTable('user', 'users');
    }
  }

  private async renameConstraintIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    oldName: string,
    newName: string,
  ): Promise<void> {
    if (oldName === newName) return;

    const hasOld = await this.constraintExists(queryRunner, oldName);
    const hasNew = await this.constraintExists(queryRunner, newName);

    if (!hasOld || hasNew) return;

    await queryRunner.query(
      `ALTER TABLE "${tableName}" RENAME CONSTRAINT "${oldName}" TO "${newName}"`,
    );
  }

  private async renameIndexIfExists(
    queryRunner: QueryRunner,
    oldName: string,
    newName: string,
  ): Promise<void> {
    if (oldName === newName) return;

    const hasOld = await this.indexExists(queryRunner, oldName);
    const hasNew = await this.indexExists(queryRunner, newName);

    if (!hasOld || hasNew) return;

    await queryRunner.query(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
  }

  private async constraintExists(
    queryRunner: QueryRunner,
    name: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      'SELECT 1 FROM pg_constraint WHERE conname = $1 LIMIT 1',
      [name],
    )) as unknown[];

    return rows.length > 0;
  }

  private async indexExists(
    queryRunner: QueryRunner,
    name: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      "SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = $1 LIMIT 1",
      [name],
    )) as unknown[];

    return rows.length > 0;
  }
}
