import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUserSessionTable1743512700000 implements MigrationInterface {
  name = 'DropUserSessionTable1743512700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "user_session" CASCADE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_session" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "refreshToken" character varying NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_session_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_session_user_id" UNIQUE ("userId"),
        CONSTRAINT "UQ_user_session_refresh_token" UNIQUE ("refreshToken"),
        CONSTRAINT "FK_user_session_user_id"
          FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_user_session_expires_at" ON "user_session" ("expiresAt")',
    );
  }
}
