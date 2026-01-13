import { Wallet } from "../utils/types";
import { db } from "../config/knexfile";


export class WalletService {
  static async createWallet(userId: string, currency: string): Promise<Wallet> {
    try {
      const existingWallet = await this.getWallet(userId, currency);
      if (existingWallet) {
        throw new Error("Wallet already exists for this user");
      }

      const [newWallet] = await db<Wallet>("wallets").insert(
        {
          id: crypto.randomUUID(),
          user_id: userId,
          currency,
          balance: 0,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        [
          "id",
          "user_id",
          "currency",
          "balance",
          "status",
          "created_at",
          "updated_at",
        ]
      );

      return newWallet;
    } catch (err) {
      console.error("Error creating wallet:", err);
      throw new Error("Error creating wallet");
    }
  }

  static async getWallet(
    userId: string,
    currency: string
  ): Promise<Wallet | null> {
    try {
      const wallet = await db<Wallet>("wallets")
        .where({ user_id: userId, currency })
        .first();

      if (!wallet) return null;

      return {
        id: wallet.id,
        user_id: wallet.user_id,
        currency: wallet.currency,
        balance: Number(wallet.balance),
        status: wallet.status as "active" | "suspended",
        created_at: new Date(wallet.created_at).toISOString(),
        updated_at: new Date(wallet.updated_at).toISOString(),
      };
    } catch (err: any) {
      console.error("Error fetching wallet:", err);
      throw new Error("Error fetching wallet");
    }
  }

  

 

 

 
}
