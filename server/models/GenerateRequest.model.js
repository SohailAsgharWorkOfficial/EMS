import mongoose from 'mongoose'
import { Schema } from "mongoose";

const GenerateRequestSchema = new Schema({
    requesttitle: {
        type: String,
        required: true
    },
    requestconent: {
        type: String,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Department"
    },
    approvedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources"
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Denied'],
        default: 'Pending'
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

export const GenerateRequest = mongoose.model("GenerateRequest", GenerateRequestSchema)