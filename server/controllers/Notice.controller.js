import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { Notice } from "../models/Notice.model.js"

const validAudience = ["Department-Specific", "Employee-Specific"]
const noticePopulate = [
    { path: "employee", select: "firstname lastname department" },
    { path: "department", select: "name description" },
    { path: "createdby", select: "firstname lastname email" },
]

export const HandleCreateNotice = async (req, res) => {
    try {
        const { title, content, audience, departmentID, employeeID } = req.body

        if (!title || !content || !audience) {
            return res.status(400).json({ success: false, message: "Title, content and audience are required" })
        }

        if (!validAudience.includes(audience)) {
            return res.status(400).json({ success: false, message: "Invalid audience type" })
        }

        if (audience === "Department-Specific") {
            if (!departmentID) {
                return res.status(400).json({ success: false, message: "Department is required for department notice" })
            }

            const department = await Department.findOne({ _id: departmentID, organizationID: req.ORGID })
            if (!department) {
                return res.status(404).json({ success: false, message: "Department not found" })
            }

            const checknotice = await Notice.findOne({
                title,
                content,
                audience,
                department: departmentID,
                createdby: req.HRid,
                organizationID: req.ORGID,
            })

            if (checknotice) {
                return res.status(400).json({ success: false, message: "Specific Notice Record Already Exists" })
            }

            const notice = await Notice.create({
                title,
                content,
                audience,
                department: departmentID,
                employee: null,
                createdby: req.HRid,
                organizationID: req.ORGID
            })

            await Department.findByIdAndUpdate(departmentID, { $addToSet: { notice: notice._id } })
            const populatedNotice = await Notice.findById(notice._id).populate(noticePopulate)

            return res.status(201).json({ success: true, message: "Specific Notice Created Successfully", data: populatedNotice })
        }

        if (audience === "Employee-Specific") {
            if (!employeeID) {
                return res.status(400).json({ success: false, message: "Employee is required for employee notice" })
            }

            const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
            if (!employee) {
                return res.status(404).json({ success: false, message: "Employee not found" })
            }

            const checknotice = await Notice.findOne({
                title,
                content,
                audience,
                employee: employeeID,
                createdby: req.HRid,
                organizationID: req.ORGID,
            })

            if (checknotice) {
                return res.status(400).json({ success: false, message: "Specific Notice Record Already Exists" })
            }

            const notice = await Notice.create({
                title,
                content,
                audience,
                employee: employeeID,
                department: null,
                createdby: req.HRid,
                organizationID: req.ORGID
            })

            await Employee.findByIdAndUpdate(employeeID, { $addToSet: { notice: notice._id } })
            const populatedNotice = await Notice.findById(notice._id).populate(noticePopulate)

            return res.status(201).json({ success: true, message: "Specific Notice Created Successfully", data: populatedNotice })
        }

        return res.status(400).json({ success: false, message: "Invalid audience selection" })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}


export const HandleAllNotice = async (req, res) => {
    try {
        const notices = await Notice.find({ organizationID: req.ORGID })
            .sort({ createdAt: -1 })
            .populate(noticePopulate)

        const data = {
            department_notices: [],
            employee_notices: []
        }
        for (let index = 0; index < notices.length; index++) {
            if (notices[index].department) {
                data.department_notices.push(notices[index])
            }
            else if (notices[index].employee) {
                data.employee_notices.push(notices[index])
            }
        }

        return res.status(200).json({ success: true, message: "All notice records retrieved successfully", data: data })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleNotice = async (req, res) => {
    try {
        const { noticeID } = req.params

        const notice = await Notice.findOne({ _id: noticeID, organizationID: req.ORGID }).populate(noticePopulate)

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" })
        }

        return res.status(200).json({ success: true, message: "Notice record retrieved successfully", data: notice })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateNotice = async (req, res) => {
    try {
        const { noticeID, UpdatedData } = req.body

        if (!noticeID || !UpdatedData || typeof UpdatedData !== "object") {
            return res.status(400).json({ success: false, message: "Notice ID and update payload are required" })
        }

        const notice = await Notice.findOne({ _id: noticeID, organizationID: req.ORGID })

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" })
        }

        const nextTitle = typeof UpdatedData.title === "string" && UpdatedData.title.trim()
            ? UpdatedData.title.trim()
            : notice.title
        const nextContent = typeof UpdatedData.content === "string" && UpdatedData.content.trim()
            ? UpdatedData.content.trim()
            : notice.content
        const nextAudience = UpdatedData.audience || notice.audience

        if (!validAudience.includes(nextAudience)) {
            return res.status(400).json({ success: false, message: "Invalid audience type" })
        }

        const previousDepartmentID = notice.department ? notice.department.toString() : null
        const previousEmployeeID = notice.employee ? notice.employee.toString() : null

        let nextDepartmentID = null
        let nextEmployeeID = null

        if (nextAudience === "Department-Specific") {
            nextDepartmentID = UpdatedData.departmentID || previousDepartmentID
            if (!nextDepartmentID) {
                return res.status(400).json({ success: false, message: "Department is required for department notice" })
            }

            const department = await Department.findOne({ _id: nextDepartmentID, organizationID: req.ORGID })
            if (!department) {
                return res.status(404).json({ success: false, message: "Department not found" })
            }
        }

        if (nextAudience === "Employee-Specific") {
            nextEmployeeID = UpdatedData.employeeID || previousEmployeeID
            if (!nextEmployeeID) {
                return res.status(400).json({ success: false, message: "Employee is required for employee notice" })
            }

            const employee = await Employee.findOne({ _id: nextEmployeeID, organizationID: req.ORGID })
            if (!employee) {
                return res.status(404).json({ success: false, message: "Employee not found" })
            }
        }

        if (previousDepartmentID && (nextAudience !== "Department-Specific" || previousDepartmentID !== nextDepartmentID)) {
            await Department.findByIdAndUpdate(previousDepartmentID, { $pull: { notice: notice._id } })
        }

        if (previousEmployeeID && (nextAudience !== "Employee-Specific" || previousEmployeeID !== nextEmployeeID)) {
            await Employee.findByIdAndUpdate(previousEmployeeID, { $pull: { notice: notice._id } })
        }

        if (nextAudience === "Department-Specific" && nextDepartmentID) {
            await Department.findByIdAndUpdate(nextDepartmentID, { $addToSet: { notice: notice._id } })
        }

        if (nextAudience === "Employee-Specific" && nextEmployeeID) {
            await Employee.findByIdAndUpdate(nextEmployeeID, { $addToSet: { notice: notice._id } })
        }

        notice.title = nextTitle
        notice.content = nextContent
        notice.audience = nextAudience
        notice.department = nextAudience === "Department-Specific" ? nextDepartmentID : null
        notice.employee = nextAudience === "Employee-Specific" ? nextEmployeeID : null
        await notice.save()

        const updatedNotice = await Notice.findById(notice._id).populate(noticePopulate)
        return res.status(200).json({ success: true, message: "Notice record updated successfully", data: updatedNotice })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteNotice = async (req, res) => {
    try {
        const { noticeID } = req.params

        const notice = await Notice.findOne({ _id: noticeID, organizationID: req.ORGID })

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice Record Not Found" })
        }

        if (notice.employee) {
            await Employee.findByIdAndUpdate(notice.employee, { $pull: { notice: notice._id } })
        }

        if (notice.department) {
            await Department.findByIdAndUpdate(notice.department, { $pull: { notice: notice._id } })
        }

        await notice.deleteOne()
        return res.status(200).json({ success: true, message: "Notice deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}
