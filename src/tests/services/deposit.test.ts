import { DepositService } from "../../service/deposit.service";
import { db } from "../../config/knexfile";
import axios from "axios";

jest.mock("axios");
jest.mock("../src/service/transactionService");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DepositService", () => {
  describe("calculateFee", () => {
    it("should apply the minimum fee for small amounts", () => {
      const fee = DepositService.calculateFee(100);
      expect(fee).toBe(50);
    });

    it("should apply 0.5% fee for large amounts", () => {
      const fee = DepositService.calculateFee(100000);
      expect(fee).toBe(500);
    });
  });

  describe("finalizeDeposit (Webhook Logic)", () => {
    it("should not credit wallet if transaction is already successful", async () => {
      const mockEvent = {
        event: "charge.success",
        data: { metadata: { transactionId: "t1", walletId: "w1" } }
      };

    
      const mockTrx = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: "t1", status: "success" }),
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      await (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTrx));

      await DepositService.finalizeDeposit(mockEvent);

 
      expect(mockTrx.where).toHaveBeenCalledWith({ id: "t1" });
      
      const walletUpdateCalled = mockTrx.where.mock.calls.some(call => call[0].id === "w1");
      expect(walletUpdateCalled).toBeFalsy();
    });
  });
});