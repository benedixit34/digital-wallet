import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const userTableExists = await knex.schema.hasTable("users");
  if (!userTableExists) {
    await knex.schema.createTable("users", (table) => {
      table.string("id").primary();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  const pwdResetTableExists = await knex.schema.hasTable("password_resets");
  if (!pwdResetTableExists) {
    await knex.schema.createTable("password_resets", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable();
      table.string("token").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("email");
      table.index("token")
    });

    await knex.raw(`
      ALTER TABLE password_resets 
      ADD COLUMN expires_at TIMESTAMP NOT NULL 
      DEFAULT (CURRENT_TIMESTAMP + INTERVAL 10 MINUTE)
  `);
  }

  const refreshTokenTableExists = await knex.schema.hasTable("refresh_tokens");
  if (refreshTokenTableExists) {
    await knex.schema.createTable("refresh_tokens", (table) => {
      table.increments("id").primary();
      table.string("user_id").notNullable();
      table.string("token", 255).notNullable().unique();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("refresh_tokens");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("password_resets");
}