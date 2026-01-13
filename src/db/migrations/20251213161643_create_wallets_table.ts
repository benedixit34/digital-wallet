import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("wallets");
  if (!exists) {
    await knex.schema.createTable("wallets", (table) => {
      table.uuid("id").primary();
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("currency", 10).notNullable();
      table.bigInteger("balance").notNullable();
      table.enum("status", ["active", "suspended"]).defaultTo("active");
      table.timestamps(true, true);
      table.unique(["user_id", "currency"]);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wallets");
}
