import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('idempotency_keys', (table)=>{
        table.string('key').primary()
        table.string('action').notNullable()
        table.jsonb('response');
        table.uuid('transaction_id')
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('idempotency_keys');
}

