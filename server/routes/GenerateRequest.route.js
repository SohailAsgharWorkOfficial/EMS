import express from 'express'
import { HandleAllGenerateRequest, HandleCreateGenerateRequest, HandleDeleteRequest, HandleGenerateRequest, HandleUpdateRequestByEmployee, HandleUpdateRequestByHR } from '../controllers/GenerateRequest.controller.js'

import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()


router.post("/create-request", VerifyEmployeeToken, HandleCreateGenerateRequest)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllGenerateRequest)

router.get("/:requestID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleGenerateRequest)

router.patch("/update-request-content", VerifyEmployeeToken, HandleUpdateRequestByEmployee)

router.patch("/update-request-status", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRequestByHR)

router.delete("/delete-request/:requestID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteRequest)

export default router



