import { Employee } from "../models/Employee.model.js"
import { Salary } from "../models/Salary.model.js"

export const HandleCreateSalary = async (req, res) => {
    try {
        const { employeeID, basicpay, bonusePT, deductionPT, duedate, currency } = req.body

        if (!employeeID || !basicpay || !bonusePT || !deductionPT || !duedate || !currency) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const employee = await Employee.findById(employeeID)

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const bonuses = (basicpay * bonusePT) / 100
        const deductions = (basicpay * deductionPT) / 100
        const netpay = (basicpay + bonuses) - deductions

        const salarycheck = await Salary.findOne({
            employee: employeeID,
            basicpay: basicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: currency,
            duedate: new Date(duedate),
        })

        if (salarycheck) {
            return res.status(400).json({ success: false, message: "Particular salary record already exists for this employee" })
        }

        const salary = await Salary.create({
            employee: employeeID,
            basicpay: basicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: currency,
            duedate: new Date(duedate),
            organizationID: req.ORGID
        })

        employee.salary.push(salary._id)
        await employee.save()

        return res.status(200).json({ success: true, message: "Salary created successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllSalary = async (req, res) => {
    try {
        const salary = await Salary.find({ organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "All salary records retrieved successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleSalary = async (req, res) => {
    try {
        const { salaryID } = req.params
        const salary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "salary found", data: salary })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleUpdateSalary = async (req, res) => {
    const { salaryID, basicpay, bonusePT, deductionPT, duedate, currency, status } = req.body
    try {

        const bonuses = (basicpay * bonusePT) / 100
        const deductions = (basicpay * deductionPT) / 100
        const netpay = (basicpay + bonuses) - deductions

        const salary = await Salary.findByIdAndUpdate(salaryID, {
            basicpay: basicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: currency,
            duedate: new Date(duedate),
            status: status
        }, { new: true })

        if (!salary) {
            return res.status(404).send({ success: false, message: "Salary record does not found" })
        }

        return res.status(200).json({ success: true, message: "Salary updated successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: error })
    }
}

export const HandleDeleteSalary = async (req, res) => {
    try {
        const { salaryID } = req.params
        const salary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID })

        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" })
        }

        const employee = await Employee.findById(salary.employee)
        employee.salary.splice(employee.salary.indexOf(salaryID), 1)

        await employee.save()
        await salary.deleteOne()

        return res.status(200).json({ success: true, message: "Salary deleted successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: error, message: "Error deleting" })
    }
}