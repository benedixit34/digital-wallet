import { Request, Response } from "express"
import { UserService } from "../../service/user.service"
import { WalletService } from "../../service/wallet.service"
import { User } from "../../utils/types"
import { generateAccessToken, generateRefreshToken } from "../../utils/token"


export class authController {
  static async register(req: Request, res: Response): Promise<void> {
    const { first_name, last_name, email, password } = req.body;

    try {
      if(await UserService.getUser(email)){
        res.status(403).json({ error: "User is already registered"})

      }

      await UserService.register(first_name, last_name, email, password);
      const user = await UserService.getUser(email);
      if (user) {
        await WalletService.createWallet(user.id, "NGN");
      }

      res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error in signing up user" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
      }

      const userId = await UserService.getUser(email).then((value) => {
        if (value){
          return value.id
        }
      })
      if (userId) {
        const accessToken = await UserService.authenticateUser(email, password);
        const refreshToken = generateRefreshToken(userId)
        await UserService.refreshAccessToken(userId, refreshToken);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ accessToken });
      } else {
        res.status(401).json({error: "Invalid User ID"})
      }

      

      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Invalid Login" });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies;

    try {
      const user = req.user as User;
      const newRefreshToken = await UserService.getRefreshToken(user.id, refreshToken);

      if (!newRefreshToken) {
        res.status(403).json({ error: "Invalid or expired refresh token" });
      }

      const accessToken = generateAccessToken(user.id);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Token Creation Error" });
    }
  }
}
