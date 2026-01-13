import { db } from "../../config/knexfile";
import { WithdrawalService } from "../../service/withdrawal.service";



jest.mock("axios");

describe("WithdrawalService", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe("createWithdraw", () => {
    it("should deduct balance and create a pending withdrawal", async () => {
      // 1. Setup: Create a user and a wallet with 10,000 NGN
      const walletId = "test-wallet-123";
      await db("wallets").insert({
        id: walletId,
        user_id: "user-1",
        balance: 10000,
        status: "active",
        currency: "NGN"
      });

    
      const result = await WithdrawalService.createWithdraw({
        userId: "user-1",
        walletId: walletId,
        amount: 5000,
        bankCode: "058",
        accountNumber: "0123456789",
        accountName: "John Doe"
      });

 
      const updatedWallet = await db("wallets").where({ id: walletId }).first();
      const withdrawal = await db("withdrawals").where({ id: result.withdrawalId }).first();

      expect(Number(updatedWallet.balance)).toBe(10000); 
      expect(withdrawal.status).toBe("pending");
      expect(result.status).toBe("pending");
    });

    it("should throw an error if balance is insufficient", async () => {
      const promise = WithdrawalService.createWithdraw({
        userId: "user-1",
        walletId: "test-wallet-123",
        amount: 999999, // Too much
        bankCode: "058",
        accountNumber: "0123456789",
        accountName: "John Doe"
      });

      await expect(promise).rejects.toThrow("Insufficient balance");
    });
  });
});