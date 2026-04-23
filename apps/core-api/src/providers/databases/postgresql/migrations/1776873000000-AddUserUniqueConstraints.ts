import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserUniqueConstraints1776873000000 implements MigrationInterface {
  name = 'AddUserUniqueConstraints1776873000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = await this.getUserTableName(queryRunner);
    if (!tableName) return;

    await this.resolveActiveDuplicateLogins(queryRunner, tableName);
    await this.resolveActiveDuplicateEmails(queryRunner, tableName);

    if (!(await this.indexExists(queryRunner, 'UQ_user_login'))) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "UQ_user_login" ON "${tableName}" ("login") WHERE "deletedAt" IS NULL`,
      );
    }

    if (!(await this.indexExists(queryRunner, 'UQ_user_email'))) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "UQ_user_email" ON "${tableName}" ("email") WHERE "deletedAt" IS NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.indexExists(queryRunner, 'UQ_user_email')) {
      await queryRunner.query('DROP INDEX "UQ_user_email"');
    }

    if (await this.indexExists(queryRunner, 'UQ_user_login')) {
      await queryRunner.query('DROP INDEX "UQ_user_login"');
    }
  }

  private async getUserTableName(
    queryRunner: QueryRunner,
  ): Promise<'user' | 'users' | null> {
    if (await queryRunner.hasTable('user')) return 'user';
    if (await queryRunner.hasTable('users')) return 'users';
    return null;
  }

  private async indexExists(
    queryRunner: QueryRunner,
    indexName: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      "SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = $1 LIMIT 1",
      [indexName],
    )) as unknown[];

    return rows.length > 0;
  }

  private async resolveActiveDuplicateLogins(
    queryRunner: QueryRunner,
    tableName: 'user' | 'users',
  ): Promise<void> {
    await queryRunner.query(
      `
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY login ORDER BY id ASC) AS rn
        FROM "${tableName}"
        WHERE "deletedAt" IS NULL
      )
      UPDATE "${tableName}" u
      SET login = CONCAT(u.login, '_dedup_', u.id::text)
      FROM ranked r
      WHERE u.id = r.id
        AND r.rn > 1
      `,
    );
  }

  private async resolveActiveDuplicateEmails(
    queryRunner: QueryRunner,
    tableName: 'user' | 'users',
  ): Promise<void> {
    await queryRunner.query(
      `
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY email ORDER BY id ASC) AS rn
        FROM "${tableName}"
        WHERE "deletedAt" IS NULL
      )
      UPDATE "${tableName}" u
      SET email = CASE
                    WHEN POSITION('@' IN u.email) > 0 THEN
                      CONCAT(
                        SPLIT_PART(u.email, '@', 1),
                        '+dedup',
                        u.id::text,
                        '@',
                        SPLIT_PART(u.email, '@', 2)
                      )
                    ELSE CONCAT(u.email, '+dedup', u.id::text)
                  END
      FROM ranked r
      WHERE u.id = r.id
        AND r.rn > 1
      `,
    );
  }
}
