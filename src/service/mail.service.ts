import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()


export class MailService{
    public static async sendEmail (recipient: string, subject: string, text: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        })
        const recipients = [recipient]
        const message= {
            from: `"Demo Credit" <${process.env.EMAIL_USER}>`,
            to: recipients,
            subject: subject,
            text: text
        }

        await transporter.sendMail(message)
    }
}