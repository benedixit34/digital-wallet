import { Request, Response } from "express";
import crypto from "crypto";
import { WithdrawalService } from "../service/withdrawal.service";
import { DepositService } from "../service/deposit.service";

export class PaystackWebhookController {
  static async handle(req: Request, res: Response): Promise<void> {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      res.status(401).send("Invalid signature");
      return;
    }

    const event = req.body;
    res.status(200).send("Webhook Received");

    try {
      switch (event.event) {
        case "charge.success":
          await DepositService.finalizeDeposit(event.data.reference);
          break;

        case "transfer.success":
          await WithdrawalService.finalizeWithdrawal(event.data.reference);
          break;

        case "transfer.failed":
        case "transfer.reversed":
          await WithdrawalService.failWithdrawal(event.data.reference);
          break;

        default:
          console.log(`Unhandled event type: ${event.event}`);
      }
    } catch (error) {
      console.error("Webhook Processing Error:", error);
    }
  }
}
