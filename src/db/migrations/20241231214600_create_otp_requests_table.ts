import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("otp_requests");
  if (!exists) {
    await knex.schema.createTable("otp_requests", (table) => {
      table.increments("id").primary();
      table.string("user_id").notNullable();
      table.string("otp").notNullable();
      table.timestamp("expires_at").notNullable();
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("otp_requests");
}
