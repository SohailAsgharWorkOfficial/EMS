import { Applicant } from "../models/Applicant.model.js"

export const HandleCreateApplicant = async (req, res) => {
    try {
        const { firstname, lastname, email, contactnumber, appliedrole } = req.body

        if (!firstname || !lastname || !email || !contactnumber || !appliedrole) {
            throw new Error("All fields are required")
        }

        const applicant = await Applicant.findOne({ email: email, organizationID: req.ORGID })

        if (applicant) {
            return res.status(409).json({ success: false, message: "Applicant already exists" })
        }

        const newApplicant = await Applicant.create({
            firstname,
            lastname,
            email,
            contactnumber,
            appliedrole,
            organizationID: req.ORGID
        })

        res.status(201).json({ success: true, message: "Applicant created successfully", data: newApplicant })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.find({ organizationID: req.ORGID })
        return res.status(200).json({ success: true, message: "All Applicants Found Successfully", data: applicants })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleApplicant = async (req, res) => {
    try {
        const { applicantID } = req.params
        const applicant = await Applicant.findOne({ _id: applicantID, organizationID: req.ORGID })

        if (!applicant) {
            return res.status(404).json({ success: false, message: "Applicant not found" })
        }

        return res.status(200).json({ success: true, message: "Applicant Found Successfully", data: applicant })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateApplicant = async (req, res) => {
    try {
        const { applicantID, UpdatedData } = req.body
        const applicant = await Applicant.findByIdAndUpdate(applicantID, UpdatedData, { new: true })

        if (!applicant) {
            return res.status(404).json({ success: false, message: "Applicant not found" })
        }

        return res.status(200).json({ success: true, message: "Applicant updated successfully", data: applicant })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteApplicant = async (req, res) => {
    try {
        const { applicantID } = req.params
        const deletedApplicant = await Applicant.findByIdAndDelete(applicantID)

        if (!deletedApplicant) {
            return res.status(404).json({ success: false, message: "Applicant not found" })
        }

        return res.status(200).json({ success: true, message: "Applicant deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}