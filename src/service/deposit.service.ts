import crypto from "crypto";
import { db } from "../config/knexfile";
import { TransactionService } from "./transaction.service";
import axios from 'axios'


const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
})

const DEPOSIT_FEE_PERCENT = 0.005;
const DEPOSIT_FEE_MIN = 50;  

export class DepositService {
  static calculateFee(amount: number) {
    const fee = Math.max(amount * DEPOSIT_FEE_PERCENT, DEPOSIT_FEE_MIN);
    return fee;
  }

  static async createDeposit({
    userId,
    userEmail,
    walletId,
    amount,
    currency = "usd",
    userDescription,
  }: {
    userId: string;
    userEmail: string;
    walletId: string;
    amount: number;
    currency?: string;
    userDescription?: string | null;
  }) {
    if (amount <= 0) throw new Error("Invalid deposit amount");

    const reference = `DP_${crypto.randomUUID()}`;
    const description = userDescription || "Wallet deposit";

    const transaction = await TransactionService.createTransaction({
      reference,
      type: "funding",
      amount,
      initiated_by: userId,
      description,
    });

  
    const response = await paystack.post("/transaction/initialize", {
      userEmail,
      amount: Math.round(amount * 100),
      currency,
      reference,
      metadata: {
        transactionId: transaction.id,
        walletId,
        userId,
      },
    });

    return {
      transactionId: transaction.id,
      reference,
      authorizationUrl: response.data.data.authorization_url,
      status: "pending",
      amount,
    };
  }

 
  static async finalizeDeposit(paystackEvent: any) {
    if (paystackEvent.event !== "charge.success") return;

    const data = paystackEvent.data;
    const { reference, metadata } = data;
    const { transactionId, walletId } = metadata;

    await db.transaction(async (trx) => {
      const wallet = await trx("wallets")
        .where({ id: walletId })
        .forUpdate()
        .first();
      if (!wallet) throw new Error("Wallet not found");

      const transaction = await trx("transactions")
        .where({ id: transactionId })
        .forUpdate()
        .first();
      if (!transaction) throw new Error("Transaction not found");

      const amount = Number(transaction.amount);
      const fee = this.calculateFee(amount);
      const netAmount = amount - fee;

      
      await trx("ledger_entries").insert({
        id: crypto.randomUUID(),
        wallet_id: wallet.id,
        transaction_id: transactionId,
        entry_type: "credit",
        amount: netAmount,
        balance_before: wallet.balance,
        balance_after: Number(wallet.balance) + netAmount,
        created_at: new Date().toISOString(),
      });

    
      await trx("wallets")
        .where({ id: wallet.id })
        .update({ cached_balance: Number(wallet.balance) + netAmount });

  
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

  
      await trx("transactions")
        .where({ id: transactionId })
        .update({ status: "success", updated_at: new Date().toISOString() });
    });
  }
}
