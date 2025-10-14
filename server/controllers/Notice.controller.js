import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { HumanResources } from "../models/HR.model.js"
import { Notice } from "../models/Notice.model.js"

export const HandleCreateNotice = async (req, res) => {
    try {
        const { title, content, audience, departmentID, employeeID, HRID } = req.body

        if (audience === "Department-Specific") {

            if (!title || !content || !audience || !departmentID || !HRID) {
                return res.status(404).json({ success: false, message: "All fields must be provided" })
            }

            const department = await Department.findById(departmentID)

            if (!department) {
                return res.status(404).json({ success: false, message: "Department not found" })
            }

            const checknotice = await Notice.findOne({
                title: title,
                content: content,
                audience: audience,
                department: departmentID,
                createdby: HRID
            })

            if (checknotice) {
                return res.status(400).json({ success: false, message: "Specific Notice Record Already Exists" })
            }

            const notice = await Notice.create({
                title: title,
                content: content,
                audience: audience,
                department: departmentID,
                createdby: HRID,
                organizationID: req.ORGID
            })

            department.notice.push(notice._id)
            await department.save()

            return res.status(200).json({ success: true, message: "Specific Notice Created Successfully", data: notice })
        }

        if (audience === "Employee-Specific") {
            if (!title || !content || !audience || !employeeID || !HRID) {
                return res.status(404).json({ success: false, message: "All fields must be provided" })
            }

            const employee = await Employee.findById(employeeID)

            if (!employee) {
                return res.status(404).json({ success: false, message: "Employee not found" })
            }

            const checknotice = await Notice.findOne({
                title: title,
                content: content,
                audience: audience,
                employee: employeeID,
                createdby: HRID
            })

            if (checknotice) {
                return res.status(400).json({ success: false, message: "Specific Notice Record Already Exists" })
            }

            const notice = await Notice.create({
                title: title,
                content: content,
                audience: audience,
                employee: employeeID,
                createdby: HRID,
                organizationID: req.ORGID
            })

            employee.notice.push(notice._id)
            await employee.save()

            return res.status(200).json({ success: true, message: "Specific Notice Created Successfully", data: notice })
        }

    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}


export const HandleAllNotice = async (req, res) => {
    try {
        const notices = await Notice.find({ organizationID: req.ORGID }).populate("employee department createdby", "firstname lastname department name description")
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

        const notice = await Notice.findOne({ _id: noticeID, organizationID: req.ORGID })

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" })
        }

        await notice.populate("employee department createdby", "firstname lastname department name description")
        return res.status(200).json({ success: true, message: "Notice record retrieved successfully", data: notice })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateNotice = async (req, res) => {
    try {

        const { noticeID, UpdatedData } = req.body
        const notice = await Notice.findByIdAndUpdate(noticeID, UpdatedData, { new: true })

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" })
        }

        return res.status(200).json({ success: true, message: "Salary record updated successfully", data: notice })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteNotice = async (req, res) => {
    try {
        const { noticeID } = req.params

        const notice = await Notice.findById(noticeID)

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice Record Not Found" })
        }

        if (notice.employee) {
            const employee = await Employee.findById(notice.employee)
            employee.notice.splice(employee.notice.indexOf(noticeID), 1)

            await employee.save()
            await notice.deleteOne()

            return res.status(200).json({ success: true, message: "Notice deleted successfully" })
        }

        if (notice.department) {
            const department = await Department.findById(notice.department)
            department.notice.splice(department.notice.indexOf(noticeID), 1)

            await department.save()
            await notice.deleteOne()

            return res.status(200).json({ success: true, message: "Notice deleted successfully" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}