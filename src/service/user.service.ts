import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/token";
import { User } from "../utils/types";
import { db } from "../config/knexfile";
import crypto from "crypto";



const SALT_ROUNDS = 12


export class UserService {
  static async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<User> {
    try {
      const existingUser = await db<User>("users").where({ email }).first();
      if (existingUser) {
        throw new Error("Email already taken.");
      }

      const hashedPassword = await bcrypt.hash(password,  SALT_ROUNDS);
      const id = crypto.randomUUID();

      const [newUser] = await db<User>("users").insert(
        {
          id,
          first_name,
          last_name,
          email,
          password: hashedPassword,
        },
        ["id", "first_name", "last_name", "email", "password"]
      );

      return newUser;
    } catch (error: any) {
      console.error("Error in register:", error);
      throw new Error("Error registering user");
    }
  }

  static async authenticateUser(
    email: string,
    password: string
  ): Promise<string> {
    try {
      const user = await db<User>("users").where({ email: email }).first();
      if (!user) {
        throw new Error("User not found.");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password.");
      }

      return generateAccessToken(user.id);
    } catch (error) {
      console.error("Error in authenticating user:", error);
      throw new Error("Error authenticating user");
    }
  }

  static async getUser(user_email: string): Promise<User | null> {
    try {
      return await db<User>("users").where({ email: user_email }).first() || null;
    } catch (error) {
      console.error("Error fetching user", error);
      throw new Error("Error fetching user");
    }
  }



  static async refreshAccessToken(
    userId: string,
    refreshToken: string
  ): Promise<string> {
    try {
      const decoded = verifyToken(refreshToken);
      if (!decoded || decoded.id !== userId) {
        throw new Error("Invalid token");
      }

      const newToken = generateRefreshToken(userId);
      await db("refresh_tokens").insert({
        user_id: userId,
        token: newToken,
        created_at: new Date(),
      });

      return newToken;
    } catch (error) {
      console.error("Error in refreshAccessToken:", error);
      throw new Error("Error refreshing access token");
    }
  }

  static async getRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const token = await db("refresh_tokens")
        .where("user_id", userId)
        .andWhere("token", refreshToken)
        .first();

      return !!token;
    } catch (error) {
      console.error("Error fetching refresh token:", error);
      return false;
    }
  }
}
