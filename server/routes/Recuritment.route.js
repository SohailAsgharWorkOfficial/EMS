import express from 'express'
import { HandleCreateRecruitment, HandleAllRecruitments, HandleEmployeeRecruitments, HandleRecruitment, HandleUpdateRecruitment, HandleDeleteRecruitment } from '../controllers/Recruitment.controller.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/create-recruitment", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateRecruitment)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllRecruitments)

router.get("/employee/all", VerifyEmployeeToken, HandleEmployeeRecruitments)

router.get("/:recruitmentID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleRecruitment)

router.patch("/update-recruitment", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRecruitment)

router.delete("/delete-recruitment/:recruitmentID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteRecruitment)

export default router
