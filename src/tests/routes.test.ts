import request from "supertest";
import express from "express";
import { DepositController } from "../controllers/deposit.controller";
import { TransferController } from "../controllers/transfer.controller";
import { PaystackWebhookController } from "../controllers/webhook.controller";
import { DepositService } from "../service/deposit.service";
import { WalletService } from "../service/wallet.service";
import { WalletTransferService } from "../service/transfer.service";
import crypto from "crypto";

const app = express();
app.use(express.json());

// Register Routes
app.post("/deposit", DepositController.deposit);
app.post("/transfer/confirm", TransferController.confirmTransfer);
app.post("/webhook/paystack", PaystackWebhookController.handle);

// Mock the Services
jest.mock("../service/depositService");
jest.mock("../service/walletService");
jest.mock("../service/transferService");

describe("Financial Routes Tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /deposit", () => {
    it("should return 201 and authorization URL on successful init", async () => {
      (WalletService.getWallet as jest.Mock).mockResolvedValue({ id: "w1", balance: 100 });
      (DepositService.createDeposit as jest.Mock).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/xyz",
        reference: "DP_123"
      });

      const res = await request(app)
        .post("/deposit")
        .send({ amount: 5000, userDescription: "Funding" });

      expect(res.status).toBe(201);
      expect(res.body.data.authorizationUrl).toBe("https://checkout.paystack.com/xyz");
    });

    it("should return 404 if wallet is not found", async () => {
      (WalletService.getWallet as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/deposit")
        .send({ amount: 5000 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wallet Not Found");
    });
  });

  describe("POST /transfer", () => {
    it("should return 200 on successful transfer", async () => {
      (WalletService.getWallet as jest.Mock).mockResolvedValue({ id: "w1", balance: 10000 });
      (WalletTransferService.transfer as jest.Mock).mockResolvedValue({ id: "t1", status: "success" });

      const res = await request(app)
        .post("/transfer")
        .send({ receiverWalletId: "w2", amount: 1000, description: "Gift" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Transfer successful");
    });

    it("should return 400 for insufficient funds", async () => {
      (WalletService.getWallet as jest.Mock).mockResolvedValue({ id: "w1", balance: 50 });

      const res = await request(app)
        .post("/transfer")
        .send({ receiverWalletId: "w2", amount: 1000 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Insufficient funds");
    });
  });

  describe("POST /webhook/paystack", () => {
    it("should return 401 if signature is invalid", async () => {
      const res = await request(app)
        .post("/webhook/paystack")
        .set("x-paystack-signature", "wrong-hash")
        .send({ event: "charge.success" });

      expect(res.status).toBe(401);
    });

    it("should return 200 and process charge.success", async () => {
      const secret = process.env.PAYSTACK_SECRET_KEY || "test_secret";
      const body = { event: "charge.success", data: { reference: "ref_1" } };
      
      // Calculate valid hash for the test
      const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");

      const res = await request(app)
        .post("/webhook/paystack")
        .set("x-paystack-signature", hash)
        .send(body);

      expect(res.status).toBe(200);
      expect(DepositService.finalizeDeposit).toHaveBeenCalled();
    });
  });
});