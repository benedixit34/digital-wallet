import { Request, Response } from "express";
import { WalletService } from "../service/wallet.service";
import { WalletTransferService } from "../service/transfer.service";
import { User } from "../utils/types"
import { OtpService } from "../service/otp.service"

export class TransferController {
  static async requestOtp(req: Request, res: Response): Promise<void>{
    try {
      const user = req.user as User;
      await OtpService.sendOTP(user.email, user.id)
      res.status(200).json({
        message: "OTP sent successfully",
      })

    } catch (error: any) {
      console.error("OTP Error:", error.message);
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred during OTP Request" 
      });

    }
  }
  static async confirmTransfer(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      const { receiverWalletId, amount, description, otp } = req.body;

      if (!otp) {
        res.status(400).json({ message: "OTP is required to complete transfer" });
        return;
      }

      const isOtpValid = await OtpService.verifyOTP(user.id, otp);
      if (!isOtpValid) {
        res.status(401).json({ message: "Invalid or expired OTP" });
        return;
      }

      const senderWallet = await WalletService.getWallet(user.id, "NGN");

      if (!senderWallet) {
        res.status(404).json({ message: "Sender wallet does not exist" });
        return;
      }

    
      const transfer = await WalletTransferService.transfer({
        senderUserId: user.id,
        senderWalletId: senderWallet.id,
        receiverWalletId,
        amount,
        description,
      });

     
      res.status(200).json({
        message: "Transfer successful",
        data: transfer,
      });

    } catch (error: any) {
      console.error("Transfer Error:", error.message);
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred during transfer" 
      });
    }
  }
}