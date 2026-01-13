import dotenv from 'dotenv'
import crypto from 'crypto'
import { db } from '../config/knexfile'
import { MailService } from './mail.service'

dotenv.config()



export class OtpService {
  private static async generateOTP(): Promise<string> {
    return crypto.randomInt(100000, 999999).toString()
  }

  public static async sendOTP(email: string, userId: string): Promise<void> {

    const newOTP = await this.generateOTP()

    const otp = await db('otp_requests').where({ user_id: userId }).first()

    if (otp) {
        await db('otp_requests')
            .where({ id: otp.id }) 
            .del()
    }

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000)

    await db('otp_requests').insert({
        user_id: userId,
        otp: newOTP,
        expires_at: expirationTime,
    })

    const subject = 'Your OTP for Pin Reset'
    const text = `Your OTP is ${newOTP}. It will expire in 5 minutes.` 

    MailService.sendEmail(email, subject, text)
}


  public static async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const otpEntry = await db('otp_requests')
      .where({ user_id: userId, otp })
      .first()

    if (!otpEntry) {
      throw new Error('Invalid OTP')
    }

    if (new Date() > new Date(otpEntry.expires_at)) {
      throw new Error('OTP has expired')
    }

    await db('otp_requests').where({ user_id: userId, otp: otp }).del()

    return true
  }
}
