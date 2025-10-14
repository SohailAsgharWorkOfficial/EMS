import express from 'express'
import { HandleAllEvents, HandleCreateEvent, HandleDeleteEvent, HandleEvent, HandleUpdateEvent } from '../controllers/CorporateCalendar.controller.js'
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"

const router = express.Router()

router.post("/create-event",  VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateEvent)

router.get("/all",  VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllEvents)

router.get("/:eventID",  VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEvent)

router.patch("/update-event",  VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateEvent)

router.delete("/delete-event/:eventID",  VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteEvent) 

export default router