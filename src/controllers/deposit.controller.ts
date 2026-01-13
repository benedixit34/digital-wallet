import { Request, Response } from "express";
import { DepositService } from "../service/deposit.service";
import { WalletService } from "../service/wallet.service";
import { User } from "../utils/types";

export class DepositController {
  static async deposit(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      const { amount, userDescription } = req.body;
      const wallet = await WalletService.getWallet(user.id, "NGN");

      if (!wallet) {   
        res.status(404).json({ message: "Wallet Not Found" });
        return;
      }


      const deposit = await DepositService.createDeposit({
        userId: user.id,
        userEmail: user.email,
        walletId: wallet.id,
        amount,
        currency: "NGN",
        userDescription,
      });
      
      res.status(201).json({
        message: "Deposit initiated successfully",
        data: deposit,
      });
      
    } catch (error) {
   
      console.error("Deposit Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}