import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("ledger_entries");
  if (!exists) {
    await knex.schema.createTable("ledger_entries", (table) => {
      table.uuid("id").primary();
      table.uuid('wallet_id').notNullable();
      table.uuid("transaction_id").notNullable();
      table
        .foreign("wallet_id")
        .references("id")
        .inTable("wallets")
        .onDelete("CASCADE");
      
      table
        .foreign("transaction_id")
        .references("id")
        .inTable("transactions")
        .onDelete("CASCADE");
      table.enum("entry_type", ["credit", "debit"]).notNullable();
      table.bigInteger("amount").notNullable();
      table.bigInteger("balance_before").notNullable();
      table.bigInteger("balance_after").notNullable();
      table.string("description");
      table.timestamps(true, true);

      table.index(["wallet_id"]);
      table.index(["transaction_id"]);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("ledger_entries");
}
