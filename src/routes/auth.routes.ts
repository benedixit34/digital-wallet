import { Router } from "express"
import { authController } from "../controllers/auth/auth.controller"
import { logoutController } from "../controllers/auth/logout.controller"
import { authenticateToken, isAuthenticated } from "../middlewares/auth.middleware"
import { passwordResetController } from "../controllers/auth/passwordreset.controller"

const router = Router()

router.post("/auth/register", isAuthenticated, authController.register)
router.post("/auth/login", isAuthenticated, authController.login)
router.post("/auth/refresh-token", authController.refreshToken)
router.post("/auth/logout", authenticateToken, logoutController.logout)
router.post("/auth/password-reset", passwordResetController.resetPassword)
router.post("/auth/password-reset/request", passwordResetController.requestPasswordReset)


export default router