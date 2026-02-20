import { Applicant } from "../models/Applicant.model.js"
import { Recruitment } from "../models/Recruitment.model.js"
import { Organization } from "../models/Organization.model.js"

const normalizeText = (value) => String(value || "").trim()

export const HandlePublicOpenings = async (req, res) => {
    try {
        const organizationURL = normalizeText(req.query.organizationURL)
        const query = {}

        if (organizationURL) {
            const organization = await Organization.findOne({ OrganizationURL: organizationURL }).select("_id")
            if (!organization) {
                return res.status(404).json({ success: false, message: "Organization not found for provided URL" })
            }
            query.organizationID = organization._id
        }

        const openings = await Recruitment.find(query)
            .sort({ createdAt: -1 })
            .populate("department", "name")
            .populate("organizationID", "name OrganizationURL")
            .select("jobtitle description department organizationID createdAt")

        return res.status(200).json({ success: true, message: "Openings fetched successfully", data: openings })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

export const HandlePublicApplicantApply = async (req, res) => {
    try {
        const {
            recruitmentID,
            firstname,
            lastname,
            email,
            contactnumber,
        } = req.body

        if (!recruitmentID || !firstname || !lastname || !email || !contactnumber) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const recruitment = await Recruitment.findById(recruitmentID).select("jobtitle organizationID")
        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment opening not found" })
        }

        const existingApplicantInOrg = await Applicant.findOne({
            email: normalizeText(email),
            organizationID: recruitment.organizationID,
        })

        if (existingApplicantInOrg) {
            return res.status(409).json({ success: false, message: "You have already applied for this organization" })
        }

        const newApplicant = await Applicant.create({
            firstname: normalizeText(firstname),
            lastname: normalizeText(lastname),
            email: normalizeText(email),
            contactnumber: normalizeText(contactnumber),
            appliedrole: recruitment.jobtitle,
            recruitmentstatus: "Pending",
            organizationID: recruitment.organizationID,
        })

        await Recruitment.findByIdAndUpdate(recruitmentID, {
            $addToSet: { application: newApplicant._id },
        })

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: newApplicant,
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "This email is already registered as an applicant" })
        }
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

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
