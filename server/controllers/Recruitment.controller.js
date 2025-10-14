import { Recruitment } from "../models/Recruitment.model.js"
import { Applicant } from "../models/Applicant.model.js"

export const HandleCreateRecruitment = async (req, res) => {
    try {
        const { jobtitle, description } = req.body

        if (!jobtitle || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const recruitment = await Recruitment.findOne({ jobtitle: jobtitle, organizationID: req.ORGID })

        if (recruitment) {
            return res.status(409).json({ success: false, message: "Recruitment already exists for this job title" })
        }

        const newRecruitment = await Recruitment.create({
            jobtitle,
            description,
            organizationID: req.ORGID
        })

        return res.json({ success: true, message: "Recruitment created successfully", data: newRecruitment })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllRecruitments = async (req, res) => {
    try {
        const recruitments = await Recruitment.find({ organizationID: req.ORGID }).populate("application")
        return res.status(200).json({ success: true, message: "All recruitments retrieved successfully", data: recruitments })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params

        if (!recruitmentID) {
            return res.status(400).json({ success: false, message: "Recruitment ID is required" })
        }

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID }).populate("application")
        return res.status(200).json({ success: true, message: "Recruitment retrieved successfully", data: recruitment })
    } catch (error) {
        return res.status(404).json({ success: false, message: "Recruitment not found" })
    }
}

export const HandleUpdateRecruitment = async (req, res) => {
    try {
        const { recruitmentID, jobtitle, description, departmentID, applicationIDArray } = req.body

        if (!recruitmentID || !jobtitle || !description || !departmentID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID })

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        if (applicationIDArray) {

            const applicants = recruitment.application

            const selectedApplications = []
            const rejectedApplications = []

            for (let index = 0; index < applicationIDArray.length; index++) {
                if (!applicants.includes(applicationIDArray[index])) {
                    selectedApplications.push(applicationIDArray[index])
                }
                else {
                    rejectedApplications.push(applicationIDArray[index])
                }
            }

            if (rejectedApplications.length > 0) {
                return res.status(404).json({ success: false, message: `Some Applicants Are Already Present Under the ${recruitment.jobtitle}`, rejectedApplications: rejectedApplications })
            }

            for (let index = 0; index < selectedApplications.length; index++) {
                applicants.push(selectedApplications[index])
            }

            await recruitment.save()
            return res.status(200).json({ success: true, message: "Recruitment updated successfully", data: recruitment })
        }

        const updatedRecruitment = await Recruitment.findByIdAndUpdate(recruitmentID, { jobtitle, description, department: departmentID }, { new: true })
        return res.status(200).json({ success: true, message: "Recruitment updated successfully", data: updatedRecruitment })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleDeleteRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params

        const recruitment = await Recruitment.findByIdAndDelete(recruitmentID)

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        return res.status(200).json({ success: true, message: "Recruitment deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}