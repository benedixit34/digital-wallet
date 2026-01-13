import { WalletTransferService } from "../../service/transfer.service";


describe("WalletTransferService", () => {
  it("should fail if sender has insufficient balance", async () => {
    const transferData = {
      senderUserId: "user_1",
      senderWalletId: "w_send",
      receiverWalletId: "w_recv",
      amount: 5000,
      description: "Test transfer"
    };

    const mockTrx = {
      where: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValueOnce({ id: "w_send", balance: 1000 }),
      rollback: jest.fn(),
    };

    await expect(WalletTransferService.transfer(transferData)).rejects.toThrow("Insufficient funds");
  });
});