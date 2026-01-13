import jwt from "jsonwebtoken"

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" })
}


export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" })
}


export const verifyToken = (refreshToken: string) => {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret") as { id: string };
}