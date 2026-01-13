import { Router } from "express"
import { WalletController } from "../controllers/wallet.controller"
import { DepositController } from "../controllers/deposit.controller"
import { TransferController } from "../controllers/transfer.controller"
import { WithdrawalController } from "../controllers/withdrawal.controller"
import { authenticateToken } from "../middlewares/auth.middleware"
import { PaystackWebhookController } from "../controllers/webhook.controller"

const router = Router()

router.use(authenticateToken)

router.get("/", WalletController.getWallet)
router.post("/fund", DepositController.deposit)
router.post("/transfer/request-otp", TransferController.requestOtp)
router.post("/transfer/confirm", TransferController.confirmTransfer)
router.post("/send", WithdrawalController.withdraw)
router.post("/webhook", PaystackWebhookController.handle)


export default router
