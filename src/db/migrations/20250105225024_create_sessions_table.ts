import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("sessions");
  if (exists) {
    await knex.schema.createTable("sessions", (table) => {
      table.string("sid").primary();
      table.json("sess").notNullable();
      table.timestamp("expired").notNullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("sessions");
}
