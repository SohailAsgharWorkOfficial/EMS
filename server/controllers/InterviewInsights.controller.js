import { Interviewinsight } from "../models/InterviewInsights.model.js"
import { Employee } from "../models/Employee.model.js"
import { Applicant } from "../models/Applicant.model.js"

const interviewPopulation = [
    { path: "applicant", select: "firstname lastname email appliedrole recruitmentstatus" },
    { path: "interviewer", select: "firstname lastname email role" },
]

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const HandleCreateInterview = async (req, res) => {
    try {
        const { applicantID, interviewerID } = req.body

        if (!applicantID || !interviewerID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const interview = await Interviewinsight.findOne({ applicant: applicantID, organizationID: req.ORGID })

        if (interview) {
            return res.status(409).json({ success: false, message: "Interview Record already exists for this applicant" })
        }

        const newInterview = await Interviewinsight.create({
            applicant: applicantID,
            interviewer: interviewerID,
            organizationID: req.ORGID
        })

        const createdInterview = await Interviewinsight.findById(newInterview._id).populate(interviewPopulation)
        return res.status(201).json({ success: true, message: "Interview Record Created successfully", data: createdInterview })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllInterviews = async (req, res) => {
    try {
        const interviews = await Interviewinsight.find({ organizationID: req.ORGID }).sort({ createdAt: -1 }).populate(interviewPopulation)
        return res.status(200).json({ success: true, message: "All Interview records Found Successfully", data: interviews })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleEmployeeInterviews = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID }).select("email")

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const employeeEmail = String(employee.email || "").trim()
        if (!employeeEmail) {
            return res.status(200).json({ success: true, message: "No interview records found", data: [] })
        }

        const applicantQuery = {
            organizationID: req.ORGID,
            email: { $regex: `^${escapeRegex(employeeEmail)}$`, $options: "i" },
        }

        const applicants = await Applicant.find(applicantQuery).select("_id")
        if (applicants.length === 0) {
            return res.status(200).json({ success: true, message: "No interview records found", data: [] })
        }

        const interviews = await Interviewinsight.find({
            organizationID: req.ORGID,
            applicant: { $in: applicants.map((applicant) => applicant._id) },
        })
            .sort({ interviewdate: -1, createdAt: -1 })
            .populate(interviewPopulation)

        return res.status(200).json({ success: true, message: "Employee interview records retrieved successfully", data: interviews })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleInterview = async (req, res) => {
    try {
        const { interviewID } = req.params
        const interview = await Interviewinsight.findOne({ _id: interviewID, organizationID: req.ORGID }).populate(interviewPopulation)

        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview Record not found" })
        }

        return res.status(200).json({ success: true, message: "Interview Record retrieved successfully", data: interview })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateInterview = async (req, res) => {
    try {
        const { interviewID, UpdatedData } = req.body

        if (!interviewID || !UpdatedData || typeof UpdatedData !== "object") {
            return res.status(400).json({ success: false, message: "Interview ID and update payload are required" })
        }

        const interview = await Interviewinsight.findOneAndUpdate(
            { _id: interviewID, organizationID: req.ORGID },
            UpdatedData,
            { new: true }
        ).populate(interviewPopulation)

        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview Record not found" })
        }
        return res.status(200).json({ success: true, message: "Interview Record updated successfully", data: interview })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteInterview = async (req, res) => {
    try {
        const { interviewID } = req.params
        const interview = await Interviewinsight.findOneAndDelete({ _id: interviewID, organizationID: req.ORGID })
        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview Record not found" })
        }
        return res.status(200).json({ success: true, message: "Interview Record deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

