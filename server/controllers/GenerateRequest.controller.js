import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { GenerateRequest } from "../models/GenerateRequest.model.js"

export const HandleCreateGenerateRequest = async (req, res) => {
    try {
        const { requesttitle, requestconent, employeeID } = req.body

        if (!requesttitle || !requestconent || !employeeID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const department = await Department.findOne({ _id: employee.department, organizationID: req.ORGID })

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" })
        }

        const generaterequest = await GenerateRequest.findOne({
            requesttitle: requesttitle,
            requestconent: requestconent,
            employee: employeeID,
            department: employee.department
        })

        if (generaterequest) {
            return res.status(409).json({ success: false, message: "Request already exists" })
        }

        const newGenerateRequest = await GenerateRequest.create({
            requesttitle: requesttitle,
            requestconent: requestconent,
            employee: employeeID,
            department: employee.department,
            organizationID: req.ORGID
        })

        employee.generaterequest.push(newGenerateRequest._id)
        await employee.save()

        return res.status(200).json({ success: true, message: "Request Generated Successfully", data: newGenerateRequest })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllGenerateRequest = async (req, res) => {
    try {
        const requestes = await GenerateRequest.find({ organizationID: req.ORGID }).populate("employee department", "firstname lastname name")
        return res.status(200).json({ success: true, message: "All requestes retrieved successfully", data: requestes })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleGenerateRequest = async (req, res) => {
    try {
        const { requestID } = req.params
        const request = await GenerateRequest.findOne({ _id: requestID, organizationID: req.ORGID }).populate("employee department", "firstname lastname name")
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }
        return res.status(200).json({ success: true, message: "Request retrieved successfully", data: request })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateRequestByEmployee = async (req, res) => {
    try {
        const { requestID, requesttitle, requestconent } = req.body
        const request = await GenerateRequest.findByIdAndUpdate(requestID, { requesttitle, requestconent }, { new: true })

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request updated successfully", data: request })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateRequestByHR = async (req, res) => {
    try {
        const { requestID, approvedby, status } = req.body

        const request = await GenerateRequest.findByIdAndUpdate(requestID, { approvedby, status }, { new: true })

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request updated successfully", data: request })
    } catch (error) {
        return res.status(500).json({ error: error, success: false, message: "Internal Server Error" })
    }
}


export const HandleDeleteRequest = async (req, res) => {
    try {
        const { requestID } = req.params
        const request = await GenerateRequest.findOne({ _id: requestID, organizationID: req.ORGID }

        )

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        const employee = await Employee.findById(request.employee)

        const index = employee.generaterequest.indexOf(requestID)
        employee.generaterequest.splice(index, 1)
        await employee.save()

        await request.deleteOne()

        return res.status(200).json({ success: true, message: "Request deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}