import { Recruitment } from "../models/Recruitment.model.js"
import { Applicant } from "../models/Applicant.model.js"
import { Department } from "../models/Department.model.js"

const recruitmentPopulation = [
    {
        path: "application",
        select: "firstname lastname email appliedrole recruitmentstatus",
    },
    {
        path: "department",
        select: "name description",
    },
]

export const HandleCreateRecruitment = async (req, res) => {
    try {
        const { jobtitle, description, departmentID } = req.body

        if (!jobtitle || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const recruitment = await Recruitment.findOne({ jobtitle: jobtitle, organizationID: req.ORGID })

        if (recruitment) {
            return res.status(409).json({ success: false, message: "Recruitment already exists for this job title" })
        }

        let selectedDepartment = null
        if (departmentID) {
            selectedDepartment = await Department.findOne({ _id: departmentID, organizationID: req.ORGID })

            if (!selectedDepartment) {
                return res.status(404).json({ success: false, message: "Department not found" })
            }
        }

        const newRecruitment = await Recruitment.create({
            jobtitle,
            description,
            department: selectedDepartment?._id,
            organizationID: req.ORGID
        })

        const createdRecruitment = await Recruitment.findById(newRecruitment._id).populate(recruitmentPopulation)
        return res.status(201).json({ success: true, message: "Recruitment created successfully", data: createdRecruitment })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllRecruitments = async (req, res) => {
    try {
        const recruitments = await Recruitment.find({ organizationID: req.ORGID }).sort({ createdAt: -1 }).populate(recruitmentPopulation)
        return res.status(200).json({ success: true, message: "All recruitments retrieved successfully", data: recruitments })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleEmployeeRecruitments = async (req, res) => {
    try {
        const recruitments = await Recruitment.find({ organizationID: req.ORGID })
            .sort({ createdAt: -1 })
            .populate("department", "name description")
            .select("jobtitle description department application createdAt updatedAt")

        return res.status(200).json({ success: true, message: "Recruitment openings retrieved successfully", data: recruitments })
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

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID }).populate(recruitmentPopulation)
        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        return res.status(200).json({ success: true, message: "Recruitment retrieved successfully", data: recruitment })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleUpdateRecruitment = async (req, res) => {
    try {
        const { recruitmentID, jobtitle, description, departmentID, applicationIDArray } = req.body
        let assignmentSummary = null

        if (!recruitmentID) {
            return res.status(400).json({ success: false, message: "Recruitment ID is required" })
        }

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID })

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        let hasUpdates = false

        if (typeof jobtitle === "string" && jobtitle.trim()) {
            recruitment.jobtitle = jobtitle.trim()
            hasUpdates = true
        }

        if (typeof description === "string" && description.trim()) {
            recruitment.description = description.trim()
            hasUpdates = true
        }

        if (departmentID !== undefined) {
            if (!departmentID) {
                recruitment.department = undefined
                hasUpdates = true
            } else {
                const department = await Department.findOne({ _id: departmentID, organizationID: req.ORGID })
                if (!department) {
                    return res.status(404).json({ success: false, message: "Department not found" })
                }
                recruitment.department = department._id
                hasUpdates = true
            }
        }

        if (Array.isArray(applicationIDArray)) {
            const normalizedApplicantIDs = [...new Set(
                applicationIDArray
                    .map((applicantID) => String(applicantID || "").trim())
                    .filter(Boolean)
            )]

            if (normalizedApplicantIDs.length === 0) {
                return res.status(400).json({ success: false, message: "Please select at least one applicant" })
            }

            const validApplicants = await Applicant.find({
                _id: { $in: normalizedApplicantIDs },
                organizationID: req.ORGID,
            }).select("_id")

            const validApplicantIDSet = new Set(validApplicants.map((item) => item._id.toString()))
            const existingApplicantIDSet = new Set(recruitment.application.map((item) => item.toString()))
            const selectedApplications = []
            const skippedApplicants = []

            for (let index = 0; index < normalizedApplicantIDs.length; index++) {
                const applicantID = normalizedApplicantIDs[index]

                if (!validApplicantIDSet.has(applicantID)) {
                    skippedApplicants.push(applicantID)
                    continue
                }

                if (existingApplicantIDSet.has(applicantID)) {
                    skippedApplicants.push(applicantID)
                    continue
                }

                selectedApplications.push(applicantID)
            }

            if (selectedApplications.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No new applicants available to assign for this recruitment",
                    skippedApplicants,
                })
            }

            recruitment.application.push(...selectedApplications)
            hasUpdates = true
            assignmentSummary = {
                addedApplicants: selectedApplications.length,
                skippedApplicants,
            }
        }

        if (!hasUpdates) {
            return res.status(400).json({ success: false, message: "No update payload provided" })
        }

        await recruitment.save()
        const updatedRecruitment = await Recruitment.findById(recruitmentID).populate(recruitmentPopulation)
        const updateMessage = assignmentSummary?.skippedApplicants?.length
            ? `Recruitment updated successfully. Added ${assignmentSummary.addedApplicants} applicants, skipped ${assignmentSummary.skippedApplicants.length}.`
            : "Recruitment updated successfully"

        return res.status(200).json({
            success: true,
            message: updateMessage,
            data: updatedRecruitment,
            assignmentSummary,
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleDeleteRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params

        const recruitment = await Recruitment.findOneAndDelete({ _id: recruitmentID, organizationID: req.ORGID })

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        return res.status(200).json({ success: true, message: "Recruitment deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
