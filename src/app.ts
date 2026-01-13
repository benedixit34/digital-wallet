import express, { Application } from "express"
import session from "express-session"
import authRoutes from "./routes/auth.routes"
import walletRoutes from "./routes/wallet.routes"
import { ConnectSessionKnexStore } from "connect-session-knex"
import cors from "cors"
import { db } from "./config/knexfile"
import dotenv from "dotenv"



dotenv.config()

const app: Application = express()
app.use(express.json())


const store = new ConnectSessionKnexStore ({
  knex: db,
})

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY || 'secret_key',
    cookie: {
      maxAge: 10000,
    },
    store,
    resave: false,
    saveUninitialized: false,
  }),
)


app.use(cors())

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/wallet", walletRoutes)

export default app
