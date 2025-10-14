import express from 'express'
import { HandleInitializeAttendance, HandleAllAttendance, HandleAttendance, HandleUpdateAttendance, HandleDeleteAttendance } from '../controllers/Attendance.controller.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/initialize", VerifyEmployeeToken, HandleInitializeAttendance)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllAttendance)

router.get("/:attendanceID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAttendance)

router.patch("/update-attendance", VerifyEmployeeToken, HandleUpdateAttendance)

router.delete("/delete-attendance/:attendanceID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteAttendance)

export default router