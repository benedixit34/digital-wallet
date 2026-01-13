import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("users").del(); // Clear existing entries
    await knex("users").insert([
        { first_name: "Benjamin", last_name: "Button", email: "benjamin@hello.com", password: "hashed_password" },
        { first_name: "Bob", last_name: "Marley", email: "bob@hello.com", password: "hashed_password" },
        { first_name: "Aisha", last_name: "Sesay", email: "aisha@hello.com", password: "hashed_password" },
    ])
}
