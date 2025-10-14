import express from "express"
import { HandleCreateBalance, HandleAllBalances, HandleBalance, HandleUpdateBalance, HandleDeleteBalance } from "../controllers/Balance.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/add-balance", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateBalance)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllBalances)

router.get("/:balanceID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleBalance)

router.patch("/update-balance", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateBalance)

router.delete("/delete-balance/:balanceID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteBalance)


export default router