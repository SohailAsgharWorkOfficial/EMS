import { Interviewinsight } from "../models/InterviewInsights.model.js"

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

        return res.status(201).json({ success: true, message: "Interview Record Created successfully", data: newInterview })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllInterviews = async (req, res) => {
    try {
        const interviews = await Interviewinsight.find({ organizationID: req.ORGID }).populate("applicant interviewer", "firstname lastname email")
        return res.status(200).json({ success: true, message: "All Interview records Found Successfully", data: interviews })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleInterview = async (req, res) => {
    try {
        const { interviewID } = req.params
        const interview = await Interviewinsight.findOne({ _id: interviewID, organizationID: req.ORGID }).populate("applicant interviewer", "firstname lastname email")

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
        const interview = await Interviewinsight.findByIdAndUpdate(interviewID, UpdatedData, { new: true })
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
        const interview = await Interviewinsight.findByIdAndDelete(interviewID)
        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview Record not found" })
        }
        return res.status(200).json({ success: true, message: "Interview Record deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

