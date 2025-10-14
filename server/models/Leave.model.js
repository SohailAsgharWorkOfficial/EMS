import mongoose from 'mongoose'
import { Schema } from "mongoose";

const LeaveSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee"
  },
  startdate: {
    type: Date,
    required: true
  },
  enddate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true,
    default: "Leave Application"
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Rejected", "Approved"],
    default: "Pending"
  },
  approvedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HumanResources"
  },
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }
}, { timestamps: true });

export const Leave = mongoose.model("Leave", LeaveSchema)