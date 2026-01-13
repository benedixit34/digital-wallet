import { Transaction } from "src/utils/types";
import { db } from "../config/knexfile";

const TRANSFER_FEE_PERCENT = 0.05
const TRANSFER_FEE_MIN = 50

export class WalletTransferService {
  static calculateFee(amount: number) {
    return Math.max(amount * TRANSFER_FEE_PERCENT, TRANSFER_FEE_MIN);
  }

  static async transfer({
    senderUserId,
    senderWalletId,
    receiverWalletId,
    amount,
    description,
  }: {
    senderUserId: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: number;
    description?: string;
  }) {
    if (amount <= 0) throw new Error("Invalid transfer amount");
    if (senderWalletId === receiverWalletId) {
      throw new Error("Cannot transfer to same wallet");
    }

    return db.transaction(async (trx) => {

      const senderWallet = await trx("wallets")
        .where({ id: senderWalletId })
        .forUpdate()
        .first();

      const receiverWallet = await trx("wallets")
        .where({ id: receiverWalletId })
        .forUpdate()
        .first();

      if (!senderWallet) throw new Error("Sender wallet not found");
      if (!receiverWallet) throw new Error("Receiver wallet not found");

      const fee = this.calculateFee(amount);
      const totalDebit = amount + fee;

      if (Number(senderWallet.balance) < totalDebit) {
        throw new Error("Insufficient balance");
      }

      const reference = `WT_${crypto.randomUUID()}`;

 
      const transaction: Transaction[] = await trx("transactions").insert(
        {
          id: crypto.randomUUID(),
          reference,
          type: "transfer",
          amount,
          initiated_by: senderUserId,
          description: description || "Wallet transfer",
          status: "success",
          created_at: new Date().toISOString(),
        },
        ["id"]
      );

      const transactionId = transaction[0].id;

  
      await trx("ledger_entries").insert({
        id: crypto.randomUUID(),
        wallet_id: senderWallet.id,
        transaction_id: transactionId,
        entry_type: "debit",
        amount: totalDebit,
        balance_before: senderWallet.balance,
        balance_after: Number(senderWallet.balance) - totalDebit,
        created_at: new Date().toISOString(),
      });

      await trx("wallets")
        .where({ id: senderWallet.id })
        .update({
          balance: Number(senderWallet.balance) - totalDebit,
        });

    
      await trx("ledger_entries").insert({
        id: crypto.randomUUID(),
        wallet_id: receiverWallet.id,
        transaction_id: transactionId,
        entry_type: "credit",
        amount,
        balance_before: receiverWallet.balance,
        balance_after: Number(receiverWallet.balance) + amount,
        created_at: new Date().toISOString(),
      });

      await trx("wallets")
        .where({ id: receiverWallet.id })
        .update({
          cached_balance: Number(receiverWallet.balance) + amount,
        });

      if (fee > 0) {
        const systemWalletId = "SYSTEM_WALLET_ID";

        await trx("ledger_entries").insert({
          id: crypto.randomUUID(),
          wallet_id: systemWalletId,
          transaction_id: transactionId,
          entry_type: "credit",
          amount: fee,
          balance_before: 0,
          balance_after: fee,
          created_at: new Date().toISOString(),
        });
      }

      return {
        transactionId,
        reference,
        status: "success",
        amount,
        fee,
      };
    });
  }
}
