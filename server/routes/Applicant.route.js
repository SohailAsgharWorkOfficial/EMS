import express from "express"
import { HandleCreateApplicant, HandleAllApplicants, HandleApplicant, HandleUpdateApplicant, HandleDeleteApplicant, HandlePublicOpenings, HandlePublicApplicantApply } from "../controllers/Applicant.controller.js"
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'


const router = express.Router()

router.get("/public/openings", HandlePublicOpenings)

router.post("/public/apply", HandlePublicApplicantApply)

router.post("/create-applicant", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateApplicant)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllApplicants)

router.get("/:applicantID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleApplicant)

router.patch("/update-applicant", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateApplicant)

router.delete("/delete-applicant/:applicantID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteApplicant)

export default router
