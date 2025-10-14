import mongoose from 'mongoose'
import { Schema } from "mongoose";

const HumanResourcesSchema = new Schema({
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
            message: 'Invalid email address format',
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
        default: "HR-Admin"
    },
    lastlogin: {
        type: Date,
        default: new Date()
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
        ref: "Department",
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, {
    timestamps: true
});

export const HumanResources = mongoose.model("HumanResources", HumanResourcesSchema)