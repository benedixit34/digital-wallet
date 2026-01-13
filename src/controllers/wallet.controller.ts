import { Request, Response } from "express"
import { WalletService } from "../service/wallet.service"
import { User } from "../utils/types"



export class WalletController {

    private static async WalletResponse(res: Response, wallet: any): Promise<void>{
        if (!wallet) {
            res.status(404).json("Wallet Not Found")
        }
        res.status(200).json(wallet)

    }

    static async createWallet(req: Request, res: Response): Promise<void>{

        const user = req.user as User
        const wallet = WalletService.createWallet(user.id, "NGN")
        this.WalletResponse(res, wallet)
    }





    static async getWallet(req: Request, res: Response): Promise<void>{
        const user = req.user as User
        const wallet = WalletService.getWallet(user.id, "NGN")
        this.WalletResponse( res, wallet)
    }
   
}
