import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("withdrawals", (table) => {
    table.uuid("id").primary();

    table
      .uuid("transaction_id")
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("CASCADE");

    table
      .uuid("wallet_id")
      .notNullable()
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");

     table.bigInteger("amount").notNullable();

    table
      .enu("status", ["pending", "paid", "failed"], {
        useNative: true,
        enumName: "withdrawal_status",
      })
      .notNullable()
      .defaultTo("pending");

    table.string("bank_code", 20).notNullable();
    table.string("account_number", 20).notNullable();
    table.timestamps(true, true);
    table.unique(["transaction_id"]);
    table.index(["wallet_id"]);
    table.index(["status"]);
  });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("withdrawals");
}
