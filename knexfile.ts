import knex, { Knex } from "knex"

import dotenv from 'dotenv'

dotenv.config()
// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "ts",
    },
  },

};

module.exports = config