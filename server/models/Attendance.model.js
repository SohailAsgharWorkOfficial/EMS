import mongoose from 'mongoose'
import { Schema } from "mongoose";


const AttendanceSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Absent', 'Not Specified']
    },
    attendancelog: [
        {
            logdate: {
                type: Date,
                required: true
            },
            logstatus: {
                type: String,
                required: true,
                enum: ['Present', 'Absent', 'Not Specified']
            }
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

export const Attendance = mongoose.model("Attendance", AttendanceSchema)