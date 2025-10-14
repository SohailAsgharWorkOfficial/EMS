import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        }
    ],
    HRs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HumanResources"
        }
    ],
    OrganizationURL: {
        type: String,
        required: true,
        unique: true
    },
    OrganizationMail: {
        type: String,
        required: true,
        unique: true
    },
},
    {
        timestamps: true,
    })

export const Organization = mongoose.model("Organization", OrganizationSchema);