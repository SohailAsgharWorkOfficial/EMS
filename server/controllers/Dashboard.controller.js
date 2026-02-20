import { Employee } from "../models/Employee.model.js"
import { Department } from "../models/Department.model.js"
import { Leave } from "../models/Leave.model.js"
import { Salary } from "../models/Salary.model.js"
import { Notice } from "../models/Notice.model.js"
import { GenerateRequest } from "../models/GenerateRequest.model.js"
import { Balance } from "../models/Balance.model.js"

const monthLabel = (date) => (
    new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
)

const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

export const HandleHRDashboard = async (req, res) => {
    try {
        const employees = await Employee.countDocuments({ organizationID: req.ORGID })
        const departments = await Department.countDocuments({ organizationID: req.ORGID })
        const leaves = await Leave.countDocuments({ organizationID: req.ORGID })
        const requestes = await GenerateRequest.countDocuments({ organizationID: req.ORGID })
        const salaries = await Salary.find({ organizationID: req.ORGID })
            .select("netpay duedate status createdAt")
            .sort({ duedate: 1, createdAt: 1 })

        const monthlySalaryMap = new Map()

        for (let index = 0; index < salaries.length; index++) {
            const salary = salaries[index]
            const salaryDate = salary.duedate ? new Date(salary.duedate) : new Date(salary.createdAt)
            const bucketKey = `${salaryDate.getFullYear()}-${String(salaryDate.getMonth() + 1).padStart(2, "0")}`

            if (!monthlySalaryMap.has(bucketKey)) {
                monthlySalaryMap.set(bucketKey, {
                    sortDate: new Date(salaryDate.getFullYear(), salaryDate.getMonth(), 1),
                    expensemonth: monthLabel(salaryDate),
                    totalDueAmount: 0,
                    totalPaidAmount: 0,
                })
            }

            const targetBucket = monthlySalaryMap.get(bucketKey)
            const netpay = toNumber(salary.netpay)
            targetBucket.totalDueAmount += netpay

            if (salary.status === "Paid") {
                targetBucket.totalPaidAmount += netpay
            }
        }

        const computedBalance = Array.from(monthlySalaryMap.values())
            .sort((a, b) => a.sortDate - b.sortDate)
            .map((bucket) => ({
                expensemonth: bucket.expensemonth,
                totalexpenses: Number(bucket.totalPaidAmount.toFixed(2)),
                availableamount: Number((bucket.totalDueAmount - bucket.totalPaidAmount).toFixed(2)),
            }))

        let balance = computedBalance

        if (balance.length === 0) {
            balance = await Balance.find({ organizationID: req.ORGID }).sort({ submitdate: 1, createdAt: 1 })
        }

        const notices = await Notice.find({ organizationID: req.ORGID }).sort({ createdAt: -1 }).limit(10).populate("createdby", "firstname lastname")

        return res.status(200).json({ success: true, data: { employees: employees, departments: departments, leaves: leaves, requestes: requestes, balance: balance, notices: notices } })
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}
