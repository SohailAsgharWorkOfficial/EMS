import express from "express"
import { HandleCreateApplicant, HandleAllApplicants, HandleApplicant, HandleUpdateApplicant, HandleDeleteApplicant } from "../controllers/Applicant.controller.js"
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'


const router = express.Router()

router.post("/create-applicant", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateApplicant)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllApplicants)

router.get("/:applicantID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleApplicant)

router.patch("/update-applicant", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateApplicant)

router.delete("/delete-applicant/:applicantID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteApplicant)

export default router