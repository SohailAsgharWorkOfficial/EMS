import mongoose from 'mongoose'
import { Schema } from "mongoose";

const SalarySchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    basicpay: {
        type: Number,
        required: true
    },
    bonuses: {
        type: Number,
        required: true
    },
    deductions: {
        type: Number,
        required: true
    },
    netpay: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    duedate: {
        type: Date,
        required: true
    },
    paymentdate: {
        type: Date,
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Delayed", "Paid"],
        default: "Pending",
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

export const Salary = mongoose.model('Salary', SalarySchema)
