import { db } from "../../config/knexfile"
import { Request, Response } from "express"
import crypto from "crypto"
import { UserService } from "../../service/user.service"
import dotenv from "dotenv"
import { MailService } from "../../service/mail.service"
import bcrypt from "bcrypt"

dotenv.config()



export class passwordResetController{
    static async requestPasswordReset(req: Request, res: Response): Promise<void> {

       try {
            const { email } = req.body
              const user = await UserService.getUser(email)

            if (!user){
                res.status(404).json({message: " User not found"})
            }

            const token = crypto.randomBytes(32).toString("hex")
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

            await db("password_resets").insert({
                email,
                token,
                expires_at: expiresAt,
            })

            const route = "api/v1/auth/password-reset"
            const resetUrl = `${req.protocol}://${req.get("host")}/${route}?token=${token}`
            const subject = "Password Reset Link"
            const text = `Here is the the link to reset your password ${resetUrl}`
            MailService.sendEmail(email, subject, text)
             res.status(200).json({ message: "Password reset link sent to your email" })
        
       } catch (error) {
        res.status(400).json({ message: error })
       }
    }


    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.query as { token?: string}

            if (!token) {
                res.status(400).json({ message: "Token is required" });
            }

            const { newPassword } = req.body
            if (!newPassword){
                res.status(400).json({ message: "Password is required" });
            }

            const resetEntry = await db('password_resets').where({ token }).first()

            if (!resetEntry) {
                res.status(400).json({ message: "Invalid or expired token" })
            }
        
            if (new Date() > new Date(resetEntry.expires_at)) {
                res.status(400).json({ message: "Token has expired" })
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await db("users").where({ email: resetEntry.email }).update({ password: hashedPassword })

            await db("password_resets").where({ token }).del()
            res.status(200).json({ message: "Password Change is Successful" })
            
        } catch (error) {
            res.status(400).json({ message: error })      
        }
        
    }
 

}