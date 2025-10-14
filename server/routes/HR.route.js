import express from 'express'
import { HandleAllHR, HandleDeleteHR, HandleHR, HandleUpdateHR } from '../controllers/HR.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()


router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllHR)

router.get("/:HRID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleHR)

router.patch("/update-HR", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateHR)

router.delete("/delete-HR/:HRID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteHR) 


export default router