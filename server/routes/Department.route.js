import express from "express"
import { HandleCreateDepartment, HandleAllDepartments, HandleDepartment, HandleUpdateDepartment, HandleDeleteDepartment } from "../controllers/Department.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/create-department", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateDepartment)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllDepartments) 

router.get("/:departmentID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDepartment)

router.patch("/update-department", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateDepartment)

router.delete("/delete-department", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteDepartment) 


export default router 