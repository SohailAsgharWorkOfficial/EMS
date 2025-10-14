import mongoose from 'mongoose'
import { Schema } from "mongoose";

const EmployeeSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address format, please enter a valid email address',
        }
    },
    password: {
        type: String,
        required: true,
    },
    contactnumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["HR-Admin", "Employee"],
        required: true,
    },
    lastlogin: {
        type: Date,
        default: Date.now
    },
    isverified: {
        type: Boolean,
        default: false
    },
    verificationtoken: {
        type: String
    },
    verificationtokenexpires: {
        type: Date
    },
    resetpasswordtoken: {
        type: String
    },
    resetpasswordexpires: {
        type: Date
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    attendance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance"
    },
    notice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notice"
        }
    ],
    salary: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salary"
        }
    ],
    leaverequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Leave"
        }
    ],
    generaterequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GenerateRequest"
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
},
    { timestamps: true }
);

export const Employee = mongoose.model('Employee', EmployeeSchema)