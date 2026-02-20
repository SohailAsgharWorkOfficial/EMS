import { Employee } from "../models/Employee.model.js"
import { Salary } from "../models/Salary.model.js"

const parseNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : NaN
}

const startOfDay = (dateValue) => {
    const date = new Date(dateValue)
    date.setHours(0, 0, 0, 0)
    return date
}

const calculateSalaryFigures = (basicpay, bonusePT, deductionPT) => {
    const bonuses = (basicpay * bonusePT) / 100
    const deductions = (basicpay * deductionPT) / 100
    const netpay = (basicpay + bonuses) - deductions

    return { bonuses, deductions, netpay }
}

export const HandleCreateSalary = async (req, res) => {
    try {
        const { employeeID, basicpay, bonusePT, deductionPT, duedate, currency } = req.body

        if (!employeeID || basicpay === undefined || bonusePT === undefined || deductionPT === undefined || !duedate || !currency) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const parsedBasicpay = parseNumber(basicpay)
        const parsedBonusePT = parseNumber(bonusePT)
        const parsedDeductionPT = parseNumber(deductionPT)
        const parsedDueDate = new Date(duedate)

        if (!Number.isFinite(parsedBasicpay) || parsedBasicpay <= 0) {
            return res.status(400).json({ success: false, message: "Basic pay must be a positive number" })
        }

        if (!Number.isFinite(parsedBonusePT) || parsedBonusePT < 0) {
            return res.status(400).json({ success: false, message: "Bonus percentage must be a non-negative number" })
        }

        if (!Number.isFinite(parsedDeductionPT) || parsedDeductionPT < 0) {
            return res.status(400).json({ success: false, message: "Deduction percentage must be a non-negative number" })
        }

        if (Number.isNaN(parsedDueDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid due date" })
        }

        const today = startOfDay(new Date())
        const selectedDueDate = startOfDay(parsedDueDate)
        if (selectedDueDate < today) {
            return res.status(400).json({ success: false, message: "Due date cannot be in the past while creating salary" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const { bonuses, deductions, netpay } = calculateSalaryFigures(parsedBasicpay, parsedBonusePT, parsedDeductionPT)

        const dueDateStart = startOfDay(parsedDueDate)
        const dueDateEnd = new Date(dueDateStart)
        dueDateEnd.setDate(dueDateEnd.getDate() + 1)

        const salarycheck = await Salary.findOne({
            employee: employeeID,
            organizationID: req.ORGID,
            duedate: { $gte: dueDateStart, $lt: dueDateEnd },
        })

        if (salarycheck) {
            return res.status(409).json({ success: false, message: "Salary record already exists for this employee on the selected due date" })
        }

        const salary = await Salary.create({
            employee: employeeID,
            basicpay: parsedBasicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: String(currency).trim(),
            duedate: dueDateStart,
            organizationID: req.ORGID
        })

        employee.salary.push(salary._id)
        await employee.save()

        return res.status(201).json({ success: true, message: "Salary created successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllSalary = async (req, res) => {
    try {
        const salary = await Salary.find({ organizationID: req.ORGID })
            .sort({ duedate: -1, createdAt: -1 })
            .populate({
                path: "employee",
                select: "firstname lastname department",
                populate: { path: "department", select: "name" },
            })
        return res.status(200).json({ success: true, message: "All salary records retrieved successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleSalary = async (req, res) => {
    try {
        const { salaryID } = req.params
        const salary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID }).populate({
            path: "employee",
            select: "firstname lastname department",
            populate: { path: "department", select: "name" },
        })

        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" })
        }

        return res.status(200).json({ success: true, message: "salary found", data: salary })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleUpdateSalary = async (req, res) => {
    const { salaryID, basicpay, bonusePT, deductionPT, duedate, currency, status } = req.body
    try {
        if (!salaryID) {
            return res.status(400).json({ success: false, message: "Salary ID is required" })
        }

        const existingSalary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID })

        if (!existingSalary) {
            return res.status(404).send({ success: false, message: "Salary record does not found" })
        }

        const existingBonusPT = existingSalary.basicpay > 0 ? (existingSalary.bonuses * 100) / existingSalary.basicpay : 0
        const existingDeductionPT = existingSalary.basicpay > 0 ? (existingSalary.deductions * 100) / existingSalary.basicpay : 0

        const nextBasicpay = basicpay !== undefined ? parseNumber(basicpay) : existingSalary.basicpay
        const nextBonusePT = bonusePT !== undefined ? parseNumber(bonusePT) : existingBonusPT
        const nextDeductionPT = deductionPT !== undefined ? parseNumber(deductionPT) : existingDeductionPT

        if (!Number.isFinite(nextBasicpay) || nextBasicpay <= 0) {
            return res.status(400).json({ success: false, message: "Basic pay must be a positive number" })
        }
        if (!Number.isFinite(nextBonusePT) || nextBonusePT < 0) {
            return res.status(400).json({ success: false, message: "Bonus percentage must be a non-negative number" })
        }
        if (!Number.isFinite(nextDeductionPT) || nextDeductionPT < 0) {
            return res.status(400).json({ success: false, message: "Deduction percentage must be a non-negative number" })
        }

        const { bonuses, deductions, netpay } = calculateSalaryFigures(nextBasicpay, nextBonusePT, nextDeductionPT)
        const updatePayload = {
            basicpay: nextBasicpay,
            bonuses,
            deductions,
            netpay,
        }

        if (currency !== undefined) {
            const normalizedCurrency = String(currency).trim()
            if (!normalizedCurrency) {
                return res.status(400).json({ success: false, message: "Currency cannot be empty" })
            }
            updatePayload.currency = normalizedCurrency
        }

        if (duedate !== undefined) {
            const parsedDueDate = new Date(duedate)
            if (Number.isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid due date" })
            }
            updatePayload.duedate = startOfDay(parsedDueDate)
        }

        if (status !== undefined) {
            if (!["Pending", "Delayed", "Paid"].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid salary status" })
            }

            updatePayload.status = status

            if (status === "Paid") {
                updatePayload.paymentdate = new Date()
            } else {
                updatePayload.paymentdate = null
            }
        }

        const salary = await Salary.findOneAndUpdate(
            { _id: salaryID, organizationID: req.ORGID },
            updatePayload,
            { new: true }
        ).populate({
            path: "employee",
            select: "firstname lastname department",
            populate: { path: "department", select: "name" },
        })

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
        if (employee) {
            const index = employee.salary.findIndex((item) => item.toString() === salaryID)
            if (index >= 0) {
                employee.salary.splice(index, 1)
                await employee.save()
            }
        }

        await salary.deleteOne()

        return res.status(200).json({ success: true, message: "Salary deleted successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: error, message: "Error deleting" })
    }
}
