import crypto from "crypto";
import { db } from "../config/knexfile";
import {
  Transaction,
  TransactionType,
} from "../utils/types";

export class TransactionService {
  static async createTransaction(data: {
    reference: string;
    type: TransactionType;
    amount: number;
    initiated_by: string | null;
    description: string | null;
  }): Promise<Transaction> {
    try {
      const existing = await db<Transaction>("transactions")
        .where({
          reference: data.reference,
        })
        .first();
      if (existing) {
        return {
          ...existing,
          amount: Number(existing.amount),
          created_at: new Date(existing.created_at).toISOString(),
          updated_at: new Date(existing.updated_at).toISOString(),
        };
      }
      const now = new Date().toISOString();

      const [newTransaction] = await db<Transaction>("transactions").insert(
        {
          id: crypto.randomUUID(),
          reference: data.reference,
          type: data.type,
          amount: data.amount,
          status: "pending",
          initiated_by: data.initiated_by || null,
          description: data.description || null,
          created_at: now,
          updated_at: now,
        },
        [
          "id",
          "reference",
          "type",
          "status",
          "amount",
          "initiated_by",
          "description",
          "created_at",
          "updated_at",
        ]
      );
      return {
        ...newTransaction,
        amount: Number(newTransaction.amount),
        created_at: new Date(newTransaction.created_at).toISOString(),
        updated_at: new Date(newTransaction.updated_at).toISOString(),
      };
    } catch (error) {
      console.error(error)
      throw new Error("Error In Transaction")
    }
  }
}
