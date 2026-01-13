import { Request, Response } from "express"
import { db } from "../../config/knexfile"

export class logoutController {
    static async logout (req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.body
        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token is required." })
        }
        try {
            await db("refresh_tokens").where({ token: refreshToken }).del()
            res.status(200).json({ message: "Logged out successfully." })
        } catch (err) {
            console.error("Logout error:", err)
            res.status(500).json({ message: "Internal server error." })
        }
  }
}