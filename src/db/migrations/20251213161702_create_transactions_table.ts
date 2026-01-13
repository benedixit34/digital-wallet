import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("transactions");
  if (!exists) {
    await knex.schema.createTable("transactions", (table) => {
      table.uuid("id").primary();
      table.string("reference").unique().notNullable();
      table
        .enum("type", [
          "funding",
          "transfer",
          "withdrawal",
          "refund",
          "admin_credit",
          "admin_debit",
        ])
        .notNullable();
      table
        .enum("status", ["pending", "success", "failed"])
        .defaultTo("pending");
      table.bigInteger("amount").notNullable();
      table
        .uuid("initiated_by")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("description");
      table.timestamps(true, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
}
