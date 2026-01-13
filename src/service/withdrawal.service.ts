import crypto from "crypto";
import axios from "axios";
import { db } from "../config/knexfile";
import { TransactionService } from "./transaction.service";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

class PayoutService {
  static async initiateTransfer({
    reference,
    amount,
    bankCode,
    accountNumber,
    accountName,
  }: {
    reference: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) {
    try {
      const recipientResponse = await axios.post(
        "https://api.paystack.co/transferrecipient",
        {
          type: "nuban",
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );

      const recipientCode = recipientResponse.data.data.recipient_code;

     
      const transferResponse = await axios.post(
        "https://api.paystack.co/transfer",
        {
          source: "balance",
          reason: "Wallet Withdrawal",
          amount: amount, 
          recipient: recipientCode,
          reference: reference,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );

      return transferResponse.data;
    } catch (error: any) {
      console.error("Paystack API Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Paystack Transfer Failed");
    }
  }
}

export class WithdrawalService {
  static async createWithdraw({
    userId,
    walletId,
    amount,
    bankCode,
    accountNumber,
    accountName,
    userDescription,
  }: {
    userId: string;
    walletId: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    userDescription?: string | null;
  }) {
    if (amount <= 0) throw new Error("Invalid withdrawal amount");

  
    return await db.transaction(async (trx) => {
  
      const wallet = await trx("wallets")
        .where({ id: walletId, user_id: userId, status: "active" })
        .forUpdate()
        .first();

      if (!wallet) throw new Error("Wallet not found");
      if (Number(wallet.balance) < amount) throw new Error("Insufficient balance");

      const reference = `WD_${crypto.randomUUID()}`;
      const description = userDescription || "Wallet withdrawal request";

      
      const transaction = await TransactionService.createTransaction({
        reference,
        type: "withdrawal",
        amount,
        initiated_by: userId,
        description,
      });

     
      const withdrawalId = crypto.randomUUID();
      await trx("withdrawals").insert({
        id: withdrawalId,
        transaction_id: transaction.id,
        wallet_id: walletId,
        amount,
        status: "pending",
        bank_code: bankCode,
        account_number: accountNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      try {
        await PayoutService.initiateTransfer({ 
            reference, 
            amount, 
            bankCode, 
            accountNumber, 
            accountName 
        });

        return {
          withdrawalId,
          transactionId: transaction.id,
          reference,
          status: "pending",
        };
      } catch (error) {
        
        throw error; 
      }
    });
  }

   static async finalizeWithdrawal(reference: string) {
      await db.transaction(async (trx) => {
        const withdrawal = await trx("withdrawals")
          .where({ transaction_id: db("transactions").select("id").where({ reference }) })
          .forUpdate()
          .first();
  
        if (!withdrawal) throw new Error("Withdrawal not found");
  
        const wallet = await trx("wallets")
          .where({ id: withdrawal.wallet_id })
          .forUpdate()
          .first();
  
       
        await trx("ledger_entries").insert({
          id: crypto.randomUUID(),
          wallet_id: wallet.id,
          transaction_id: withdrawal.transaction_id,
          entry_type: "debit",
          amount: withdrawal.amount,
          balance_before: wallet.cached_balance,
          balance_after: Number(wallet.cached_balance) - withdrawal.amount,
          created_at: new Date().toISOString(),
        });
  
       
        await trx("wallets")
          .where({ id: wallet.id })
          .update({ balance: Number(wallet.balance) - withdrawal.amount });
  
     
        await trx("transactions")
          .where({ id: withdrawal.transaction_id })
          .update({ status: "success", updated_at: new Date().toISOString() });
  
        await trx("withdrawals")
          .where({ id: withdrawal.id })
          .update({ status: "paid", updated_at: new Date().toISOString() });
      });
    }
  
   
    static async failWithdrawal(reference: string) {
      await db.transaction(async (trx) => {
        const withdrawal = await trx("withdrawals")
          .where({ transaction_id: db("transactions").select("id").where({ reference }) })
          .forUpdate()
          .first();
  
        if (!withdrawal) throw new Error("Withdrawal not found");
  
        await trx("transactions")
          .where({ id: withdrawal.transaction_id })
          .update({ status: "failed", updated_at: new Date().toISOString() });
  
        await trx("withdrawals")
          .where({ id: withdrawal.id })
          .update({ status: "failed", updated_at: new Date().toISOString() });
      });
    }
  }


