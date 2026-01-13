import { Response, Request } from "express";
import { WithdrawalService } from "../service/withdrawal.service";
import { User } from "../utils/types";
import { WalletService } from "../service/wallet.service";

export class WithdrawalController {
  static async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;

      const { amount, bankCode, accountNumber, accountName, userDescription } = req.body;

      if (!amount || !bankCode || !accountNumber) {
        res.status(400).json({
          message: "amount, bankCode and accountNumber are required",
        });
      }

      const wallet = await WalletService.getWallet(user.id, "NGN");

      if (!wallet) {
       res.status(404).json({
          message: "Wallet not found",
        });
        return;
      }

      if (user) {
        const withdrawal = await WithdrawalService.createWithdraw({
          userId: user.id,
          walletId: wallet.id,
          amount: Number(amount),
          bankCode,
          accountNumber,
          accountName,
          userDescription,
        });

        res.status(201).json({
          message: "Withdrawal initiated successfully",
          data: withdrawal,
        });
      }
    } catch (error: any) {
      res.status(404).json({
        message: error.message || "Withdrawal failed",
      });
    }
  }
}
