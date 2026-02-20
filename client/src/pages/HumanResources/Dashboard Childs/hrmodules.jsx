import { useEffect, useMemo, useState } from "react"
import { apiService } from "../../../redux/apis/APIService"
import { Loading } from "../../../components/common/loading.jsx"

const ModuleLayout = ({ title, children }) => (
    <div className="w-full mx-auto my-8 flex flex-col gap-5 h-[94%]">
        <h1 className="min-[250px]:text-2xl md:text-4xl font-bold">{title}</h1>
        <div className="border-2 border-blue-700 rounded-lg p-3 overflow-auto h-full bg-white">
            {children}
        </div>
    </div>
)

const ErrorText = ({ message }) => (
    <p className="text-red-700 font-bold">{message || "Something went wrong"}</p>
)

const ActionButton = ({ onClick, label }) => (
    <button onClick={onClick} className="px-2 py-1 text-sm bg-red-700 text-white rounded hover:bg-red-800">
        {label}
    </button>
)

const formatDate = (value) => {
    if (!value) return "-"
    try {
        return new Date(value).toLocaleDateString()
    } catch {
        return "-"
    }
}

const personName = (person) => {
    if (!person) return "-"
    const name = `${person.firstname || ""} ${person.lastname || ""}`.trim()
    return name || "-"
}

const formatCurrency = (value, currency = "PKR") => {
    const number = Number(value)
    if (!Number.isFinite(number)) return `0 ${currency}`
    return `${number.toLocaleString()} ${currency}`
}

const toDateInputValue = (value) => {
    if (!value) return ""
    try {
        const date = new Date(value)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    } catch {
        return ""
    }
}

const todayISO = () => new Date().toISOString().split("T")[0]

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const pad2 = (value) => String(value).padStart(2, "0")

const toDateKey = (value) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

const monthValueFromDate = (value = new Date()) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        const now = new Date()
        return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
    }
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

const parseMonthValue = (monthValue) => {
    const parts = String(monthValue || "").split("-")
    const year = Number(parts[0])
    const monthIndex = Number(parts[1]) - 1

    if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        const now = new Date()
        return { year: now.getFullYear(), monthIndex: now.getMonth() }
    }

    return { year, monthIndex }
}

const buildCalendarCells = (monthValue) => {
    const { year, monthIndex } = parseMonthValue(monthValue)
    const firstDay = new Date(year, monthIndex, 1)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const startWeekday = firstDay.getDay()
    const previousMonthDays = new Date(year, monthIndex, 0).getDate()
    const cells = []

    for (let index = 0; index < 42; index++) {
        const dayNumber = index - startWeekday + 1
        let date
        let inCurrentMonth = true

        if (dayNumber < 1) {
            date = new Date(year, monthIndex - 1, previousMonthDays + dayNumber)
            inCurrentMonth = false
        } else if (dayNumber > daysInMonth) {
            date = new Date(year, monthIndex + 1, dayNumber - daysInMonth)
            inCurrentMonth = false
        } else {
            date = new Date(year, monthIndex, dayNumber)
        }

        cells.push({
            dateKey: toDateKey(date),
            dayLabel: date.getDate(),
            inCurrentMonth,
        })
    }

    return cells
}

const forEachDateInRange = (startValue, endValue, callback) => {
    const start = new Date(startValue)
    const end = new Date(endValue)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    if (start > end) return

    const cursor = new Date(start)
    while (cursor <= end) {
        callback(toDateKey(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }
}

const leaveStatusClasses = (status) => {
    if (status === "Approved") return "bg-green-200 border-green-400 text-green-900"
    if (status === "Rejected") return "bg-red-200 border-red-400 text-red-900"
    if (status === "Pending") return "bg-yellow-200 border-yellow-400 text-yellow-900"
    return "bg-slate-100 border-slate-300 text-slate-800"
}

const attendanceStatusClasses = (status) => {
    if (status === "Present") return "bg-green-200 border-green-400 text-green-900"
    if (status === "Absent") return "bg-red-200 border-red-400 text-red-900"
    return "bg-slate-100 border-slate-300 text-slate-700"
}

const useModuleData = (endpoint) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await apiService.get(endpoint, { withCredentials: true })
            setData(response.data?.data)
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to fetch")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint])

    return { data, loading, error, fetchData }
}

export const HRSalariesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/salary/all")
    const [employees, setEmployees] = useState([])
    const [message, setMessage] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [employeeFilter, setEmployeeFilter] = useState("All")
    const [editForms, setEditForms] = useState({})
    const [salaryForm, setSalaryForm] = useState({
        employeeID: "",
        basicpay: "",
        bonusePT: "",
        deductionPT: "",
        duedate: "",
        currency: "PKR",
    })

    const fetchEmployees = async () => {
        try {
            const response = await apiService.get("/api/v1/employee/all-employees-ids", { withCredentials: true })
            setEmployees(response.data?.data || [])
        } catch {
            // Employees list is optional for rendering existing salary rows.
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    useEffect(() => {
        const mappedForms = {}
        for (let index = 0; index < (data || []).length; index++) {
            const item = data[index]
            const bonusPT = item.basicpay > 0 ? ((item.bonuses * 100) / item.basicpay) : 0
            const deductionPT = item.basicpay > 0 ? ((item.deductions * 100) / item.basicpay) : 0

            mappedForms[item._id] = {
                basicpay: String(item.basicpay ?? ""),
                bonusePT: String(Number(bonusPT.toFixed(2))),
                deductionPT: String(Number(deductionPT.toFixed(2))),
                duedate: toDateInputValue(item.duedate),
                currency: item.currency || "PKR",
                status: item.status || "Pending",
            }
        }
        setEditForms(mappedForms)
    }, [data])

    const filteredSalaries = useMemo(() => {
        let records = data || []
        if (statusFilter !== "All") {
            records = records.filter((item) => item.status === statusFilter)
        }
        if (employeeFilter !== "All") {
            records = records.filter((item) => item?.employee?._id === employeeFilter)
        }
        return records
    }, [data, statusFilter, employeeFilter])

    const salarySummary = useMemo(() => {
        const records = data || []
        return {
            totalNet: records.reduce((sum, item) => sum + (Number(item.netpay) || 0), 0),
            paidCount: records.filter((item) => item.status === "Paid").length,
            pendingCount: records.filter((item) => item.status === "Pending").length,
            delayedCount: records.filter((item) => item.status === "Delayed").length,
        }
    }, [data])

    const deleteSalary = async (salaryID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/salary/delete-salary/${salaryID}`, { withCredentials: true })
            setMessage("Salary record deleted successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Delete failed")
        }
    }

    const createSalary = async (e) => {
        e.preventDefault()
        try {
            setMessage("")
            await apiService.post("/api/v1/salary/create-salary", {
                employeeID: salaryForm.employeeID,
                basicpay: Number(salaryForm.basicpay),
                bonusePT: Number(salaryForm.bonusePT),
                deductionPT: Number(salaryForm.deductionPT),
                duedate: salaryForm.duedate,
                currency: salaryForm.currency,
            }, { withCredentials: true })
            setSalaryForm({
                employeeID: "",
                basicpay: "",
                bonusePT: "",
                deductionPT: "",
                duedate: "",
                currency: "PKR",
            })
            setMessage("Salary record created successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Create salary failed")
        }
    }

    const updateSalary = async (salaryID, forcedStatus) => {
        const form = editForms[salaryID]
        if (!form) return

        try {
            setMessage("")
            await apiService.patch("/api/v1/salary/update-salary", {
                salaryID,
                basicpay: Number(form.basicpay),
                bonusePT: Number(form.bonusePT),
                deductionPT: Number(form.deductionPT),
                duedate: form.duedate,
                currency: form.currency,
                status: forcedStatus || form.status,
            }, { withCredentials: true })
            setMessage("Salary record updated successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Salary update failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Salaries">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Salary Outflow</p>
                    <p className="font-bold">{formatCurrency(salarySummary.totalNet)}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Paid Records</p>
                    <p className="font-bold">{salarySummary.paidCount}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Pending Records</p>
                    <p className="font-bold">{salarySummary.pendingCount}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Delayed Records</p>
                    <p className="font-bold">{salarySummary.delayedCount}</p>
                </div>
            </div>

            <form onSubmit={createSalary} className="grid grid-cols-1 md:grid-cols-7 gap-2 border-b pb-3 mb-3">
                <select
                    value={salaryForm.employeeID}
                    onChange={(e) => setSalaryForm({ ...salaryForm, employeeID: e.target.value })}
                    className="border rounded px-2 py-1"
                    required
                >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.firstname} {emp.lastname}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-2 py-1"
                    placeholder="Basic Pay"
                    value={salaryForm.basicpay}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicpay: e.target.value })}
                    required
                />
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-2 py-1"
                    placeholder="Bonus %"
                    value={salaryForm.bonusePT}
                    onChange={(e) => setSalaryForm({ ...salaryForm, bonusePT: e.target.value })}
                    required
                />
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-2 py-1"
                    placeholder="Deduction %"
                    value={salaryForm.deductionPT}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deductionPT: e.target.value })}
                    required
                />
                <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={salaryForm.duedate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, duedate: e.target.value })}
                    min={todayISO()}
                    required
                />
                <select
                    value={salaryForm.currency}
                    onChange={(e) => setSalaryForm({ ...salaryForm, currency: e.target.value })}
                    className="border rounded px-2 py-1"
                >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="AED">AED</option>
                </select>
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Add Salary
                </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-3">
                <select
                    className="border rounded px-2 py-1"
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                >
                    <option value="All">All Employees</option>
                    {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.firstname} {emp.lastname}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>

            {filteredSalaries.length === 0 ? <p>No salary records found.</p> : null}
            {filteredSalaries.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                    <div className="flex flex-wrap justify-between gap-3">
                        <div>
                            <p className="font-bold">{item.employee ? `${item.employee.firstname} ${item.employee.lastname}` : "Employee"}</p>
                            <p className="text-sm text-gray-700">Department: {item?.employee?.department?.name || "-"}</p>
                            <p className="text-sm">Net Pay: {formatCurrency(item.netpay, item.currency)}</p>
                            <p className="text-sm">Status: {item.status}</p>
                            <p className="text-xs text-gray-600">Due: {formatDate(item.duedate)} | Payment: {formatDate(item.paymentdate)}</p>
                        </div>
                        <ActionButton label="Delete" onClick={() => deleteSalary(item._id)} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.basicpay || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], basicpay: e.target.value },
                            }))}
                            placeholder="Basic Pay"
                        />
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.bonusePT || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], bonusePT: e.target.value },
                            }))}
                            placeholder="Bonus %"
                        />
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.deductionPT || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], deductionPT: e.target.value },
                            }))}
                            placeholder="Deduction %"
                        />
                        <input
                            type="date"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.duedate || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], duedate: e.target.value },
                            }))}
                        />
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.currency || "PKR"}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], currency: e.target.value },
                            }))}
                        >
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                            <option value="INR">INR</option>
                            <option value="AED">AED</option>
                        </select>
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.status || "Pending"}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], status: e.target.value },
                            }))}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Paid">Paid</option>
                        </select>
                        <button
                            type="button"
                            className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateSalary(item._id)}
                        >
                            Update Salary
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateSalary(item._id, "Paid")}
                        >
                            Mark Paid
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-yellow-700 text-white rounded hover:bg-yellow-800"
                            onClick={() => updateSalary(item._id, "Delayed")}
                        >
                            Mark Delayed
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
                            onClick={() => updateSalary(item._id, "Pending")}
                        >
                            Mark Pending
                        </button>
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRNoticesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/notice/all")
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [message, setMessage] = useState("")
    const [audienceFilter, setAudienceFilter] = useState("All")
    const [createForm, setCreateForm] = useState({
        title: "",
        content: "",
        audience: "Department-Specific",
        departmentID: "",
        employeeID: "",
    })
    const [editForms, setEditForms] = useState({})

    const allNotices = useMemo(() => {
        const departmentNotices = Array.isArray(data?.department_notices) ? data.department_notices : []
        const employeeNotices = Array.isArray(data?.employee_notices) ? data.employee_notices : []
        return [...departmentNotices, ...employeeNotices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [data])

    const filteredNotices = useMemo(() => {
        if (audienceFilter === "All") {
            return allNotices
        }
        return allNotices.filter((item) => item.audience === audienceFilter)
    }, [allNotices, audienceFilter])

    const fetchSupportingData = async () => {
        try {
            const [departmentResponse, employeeResponse] = await Promise.all([
                apiService.get("/api/v1/department/all", { withCredentials: true }),
                apiService.get("/api/v1/employee/all-employees-ids", { withCredentials: true }),
            ])
            setDepartments(departmentResponse.data?.data || [])
            setEmployees(employeeResponse.data?.data || [])
        } catch {
            // Existing notices can still be managed without supporting dropdown data.
        }
    }

    useEffect(() => {
        fetchSupportingData()
    }, [])

    useEffect(() => {
        const forms = {}
        for (let index = 0; index < allNotices.length; index++) {
            const notice = allNotices[index]
            forms[notice._id] = {
                title: notice.title || "",
                content: notice.content || "",
                audience: notice.audience || "Department-Specific",
                departmentID: notice?.department?._id || "",
                employeeID: notice?.employee?._id || "",
            }
        }
        setEditForms(forms)
    }, [allNotices])

    const createNotice = async (e) => {
        e.preventDefault()
        try {
            setMessage("")
            const payload = {
                title: createForm.title,
                content: createForm.content,
                audience: createForm.audience,
            }

            if (createForm.audience === "Department-Specific") {
                payload.departmentID = createForm.departmentID
            } else {
                payload.employeeID = createForm.employeeID
            }

            await apiService.post("/api/v1/notice/create-notice", payload, { withCredentials: true })
            setCreateForm((prev) => ({
                ...prev,
                title: "",
                content: "",
                departmentID: "",
                employeeID: "",
            }))
            setMessage("Notice created successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Notice creation failed")
        }
    }

    const updateNotice = async (noticeID) => {
        const form = editForms[noticeID]
        if (!form) return

        try {
            setMessage("")
            const updatedData = {
                title: form.title,
                content: form.content,
                audience: form.audience,
            }

            if (form.audience === "Department-Specific") {
                updatedData.departmentID = form.departmentID
            } else {
                updatedData.employeeID = form.employeeID
            }

            await apiService.patch("/api/v1/notice/update-notice", {
                noticeID,
                UpdatedData: updatedData,
            }, { withCredentials: true })
            setMessage("Notice updated successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Notice update failed")
        }
    }

    const deleteNotice = async (noticeID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/notice/delete-notice/${noticeID}`, { withCredentials: true })
            setMessage("Notice deleted successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Issue Notices">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}

            <form onSubmit={createNotice} className="grid grid-cols-1 lg:grid-cols-5 gap-2 border-b pb-3 mb-3">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Notice Title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    required
                />
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Notice Content"
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    required
                />
                <select
                    className="border rounded px-2 py-1"
                    value={createForm.audience}
                    onChange={(e) => setCreateForm({
                        ...createForm,
                        audience: e.target.value,
                        departmentID: "",
                        employeeID: "",
                    })}
                >
                    <option value="Department-Specific">Department-Specific</option>
                    <option value="Employee-Specific">Employee-Specific</option>
                </select>
                {createForm.audience === "Department-Specific" ? (
                    <select
                        className="border rounded px-2 py-1"
                        value={createForm.departmentID}
                        onChange={(e) => setCreateForm({ ...createForm, departmentID: e.target.value })}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                            <option key={department._id} value={department._id}>{department.name}</option>
                        ))}
                    </select>
                ) : (
                    <select
                        className="border rounded px-2 py-1"
                        value={createForm.employeeID}
                        onChange={(e) => setCreateForm({ ...createForm, employeeID: e.target.value })}
                        required
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee._id} value={employee._id}>{employee.firstname} {employee.lastname}</option>
                        ))}
                    </select>
                )}
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Create Notice
                </button>
            </form>

            <div className="flex gap-2 items-center mb-3">
                <label className="font-semibold">Filter:</label>
                <select
                    className="border rounded px-2 py-1"
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Department-Specific">Department-Specific</option>
                    <option value="Employee-Specific">Employee-Specific</option>
                </select>
            </div>

            {filteredNotices.length === 0 ? <p>No notices found.</p> : null}
            {filteredNotices.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                        <div>
                            <p className="font-bold">{item.title}</p>
                            <p>{item.content}</p>
                            <p className="text-sm text-gray-700">Audience: {item.audience}</p>
                            <p className="text-sm text-gray-700">
                                Target: {item.audience === "Department-Specific" ? (item?.department?.name || "-") : personName(item.employee)}
                            </p>
                            <p className="text-sm text-gray-700">Created By: {personName(item.createdby)}</p>
                            <p className="text-xs text-gray-600">Date: {formatDate(item.createdAt)}</p>
                        </div>
                        <ActionButton label="Delete" onClick={() => deleteNotice(item._id)} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.title || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], title: e.target.value },
                            }))}
                            placeholder="Notice Title"
                        />
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.content || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], content: e.target.value },
                            }))}
                            placeholder="Notice Content"
                        />
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.audience || "Department-Specific"}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: {
                                    ...prev[item._id],
                                    audience: e.target.value,
                                    departmentID: "",
                                    employeeID: "",
                                },
                            }))}
                        >
                            <option value="Department-Specific">Department-Specific</option>
                            <option value="Employee-Specific">Employee-Specific</option>
                        </select>
                        {editForms[item._id]?.audience === "Department-Specific" ? (
                            <select
                                className="border rounded px-2 py-1"
                                value={editForms[item._id]?.departmentID || ""}
                                onChange={(e) => setEditForms((prev) => ({
                                    ...prev,
                                    [item._id]: { ...prev[item._id], departmentID: e.target.value },
                                }))}
                            >
                                <option value="">Select Department</option>
                                {departments.map((department) => (
                                    <option key={department._id} value={department._id}>{department.name}</option>
                                ))}
                            </select>
                        ) : (
                            <select
                                className="border rounded px-2 py-1"
                                value={editForms[item._id]?.employeeID || ""}
                                onChange={(e) => setEditForms((prev) => ({
                                    ...prev,
                                    [item._id]: { ...prev[item._id], employeeID: e.target.value },
                                }))}
                            >
                                <option value="">Select Employee</option>
                                {employees.map((employee) => (
                                    <option key={employee._id} value={employee._id}>{employee.firstname} {employee.lastname}</option>
                                ))}
                            </select>
                        )}
                        <button
                            type="button"
                            className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateNotice(item._id)}
                        >
                            Update Notice
                        </button>
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRLeavesPage = () => {
    const { data, loading, error } = useModuleData("/api/v1/leave/all")
    const [monthValue, setMonthValue] = useState(monthValueFromDate())
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))

    const leaveStatusSummary = useMemo(() => {
        const leaves = data || []
        return {
            total: leaves.length,
            approved: leaves.filter((item) => item.status === "Approved").length,
            pending: leaves.filter((item) => item.status === "Pending").length,
            rejected: leaves.filter((item) => item.status === "Rejected").length,
        }
    }, [data])

    const calendarCells = useMemo(() => buildCalendarCells(monthValue), [monthValue])

    const leaveCalendarMap = useMemo(() => {
        const mapped = {}
        for (let index = 0; index < (data || []).length; index++) {
            const leave = data[index]
            forEachDateInRange(leave.startdate, leave.enddate, (dateKey) => {
                if (!dateKey.startsWith(monthValue)) return
                if (!mapped[dateKey]) mapped[dateKey] = []
                mapped[dateKey].push({
                    leaveID: leave._id,
                    employeeName: personName(leave.employee),
                    title: leave.title || "Leave",
                    status: leave.status || "Pending",
                })
            })
        }
        return mapped
    }, [data, monthValue])

    const selectedDateLeaves = useMemo(() => {
        return leaveCalendarMap[selectedDate] || []
    }, [leaveCalendarMap, selectedDate])

    const handleMonthChange = (e) => {
        const nextMonth = e.target.value
        setMonthValue(nextMonth)
        const todayKey = toDateKey(new Date())
        setSelectedDate(todayKey.startsWith(nextMonth) ? todayKey : `${nextMonth}-01`)
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Leaves">
            {error ? <ErrorText message={error} /> : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Requests</p>
                    <p className="font-bold">{leaveStatusSummary.total}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Approved</p>
                    <p className="font-bold text-green-700">{leaveStatusSummary.approved}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="font-bold text-yellow-700">{leaveStatusSummary.pending}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Rejected</p>
                    <p className="font-bold text-red-700">{leaveStatusSummary.rejected}</p>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold">Month</label>
                    <input
                        type="month"
                        className="border rounded px-2 py-1"
                        value={monthValue}
                        onChange={handleMonthChange}
                    />
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded border bg-green-100 border-green-300 text-green-800">Approved</span>
                    <span className="px-2 py-1 rounded border bg-yellow-100 border-yellow-300 text-yellow-800">Pending</span>
                    <span className="px-2 py-1 rounded border bg-red-100 border-red-300 text-red-800">Rejected</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEK_DAYS.map((weekday) => (
                    <div key={weekday} className="text-xs font-bold text-center text-slate-600">{weekday}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
                {calendarCells.map((cell) => {
                    const cellLeaves = leaveCalendarMap[cell.dateKey] || []
                    const hasApproved = cellLeaves.some((item) => item.status === "Approved")
                    const hasPending = cellLeaves.some((item) => item.status === "Pending")
                    const hasRejected = cellLeaves.some((item) => item.status === "Rejected")
                    const toneClass = hasRejected
                        ? "bg-red-100 border-red-300"
                        : hasApproved
                            ? "bg-green-100 border-green-300"
                            : hasPending
                                ? "bg-yellow-100 border-yellow-300"
                                : "bg-white border-slate-200"

                    return (
                        <button
                            type="button"
                            key={cell.dateKey}
                            onClick={() => setSelectedDate(cell.dateKey)}
                            className={`min-h-24 rounded border p-2 text-left transition hover:shadow-sm ${toneClass} ${!cell.inCurrentMonth ? "opacity-40" : ""} ${selectedDate === cell.dateKey ? "ring-2 ring-blue-600" : ""}`}
                        >
                            <p className="text-xs font-bold mb-1">{cell.dayLabel}</p>
                            {cellLeaves.length > 0 ? (
                                <p className="text-[11px] font-semibold">{cellLeaves.length} leave</p>
                            ) : (
                                <p className="text-[11px] text-slate-500">No leave</p>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="border rounded p-3">
                <p className="font-semibold mb-2">Leaves on {formatDate(selectedDate)}</p>
                {selectedDateLeaves.length === 0 ? (
                    <p className="text-sm text-slate-600">No leave requests on this date.</p>
                ) : (
                    <div className="space-y-2">
                        {selectedDateLeaves.map((entry) => (
                            <div key={`${entry.leaveID}-${entry.employeeName}`} className={`rounded border px-2 py-2 text-sm ${leaveStatusClasses(entry.status)}`}>
                                <p className="font-semibold">{entry.employeeName}</p>
                                <p>{entry.title}</p>
                                <p>Status: {entry.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModuleLayout>
    )
}

export const HRAttendancesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/attendance/all")
    const [monthValue, setMonthValue] = useState(monthValueFromDate())
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))

    const deleteAttendance = async (attendanceID) => {
        try {
            await apiService.delete(`/api/v1/attendance/delete-attendance/${attendanceID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    const calendarCells = useMemo(() => buildCalendarCells(monthValue), [monthValue])

    const attendanceCalendarMap = useMemo(() => {
        const mapped = {}

        for (let index = 0; index < (data || []).length; index++) {
            const attendance = data[index]
            const employeeLabel = personName(attendance.employee)
            for (let logIndex = 0; logIndex < (attendance.attendancelog || []).length; logIndex++) {
                const log = attendance.attendancelog[logIndex]
                const dateKey = toDateKey(log.logdate)
                if (!dateKey || !dateKey.startsWith(monthValue)) continue

                if (!mapped[dateKey]) mapped[dateKey] = []
                mapped[dateKey].push({
                    attendanceID: attendance._id,
                    employeeName: employeeLabel,
                    status: log.logstatus || "Not Specified",
                })
            }
        }

        return mapped
    }, [data, monthValue])

    const attendanceSummary = useMemo(() => {
        let present = 0
        let absent = 0
        let notSpecified = 0

        const values = Object.values(attendanceCalendarMap)
        for (let index = 0; index < values.length; index++) {
            const entries = values[index]
            for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
                const status = entries[entryIndex].status
                if (status === "Present") present += 1
                else if (status === "Absent") absent += 1
                else notSpecified += 1
            }
        }

        return { present, absent, notSpecified }
    }, [attendanceCalendarMap])

    const selectedDateAttendance = useMemo(() => {
        return (attendanceCalendarMap[selectedDate] || [])
            .slice()
            .sort((a, b) => a.employeeName.localeCompare(b.employeeName))
    }, [attendanceCalendarMap, selectedDate])

    const handleMonthChange = (e) => {
        const nextMonth = e.target.value
        setMonthValue(nextMonth)
        const todayKey = toDateKey(new Date())
        setSelectedDate(todayKey.startsWith(nextMonth) ? todayKey : `${nextMonth}-01`)
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Attendances">
            {error ? <ErrorText message={error} /> : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Employees With Attendance</p>
                    <p className="font-bold">{(data || []).length}</p>
                </div>
                <div className="border rounded p-2 bg-green-50">
                    <p className="text-xs text-green-700">Present Logs</p>
                    <p className="font-bold text-green-700">{attendanceSummary.present}</p>
                </div>
                <div className="border rounded p-2 bg-red-50">
                    <p className="text-xs text-red-700">Absent Logs</p>
                    <p className="font-bold text-red-700">{attendanceSummary.absent}</p>
                </div>
                <div className="border rounded p-2 bg-slate-50">
                    <p className="text-xs text-slate-700">Not Specified Logs</p>
                    <p className="font-bold text-slate-700">{attendanceSummary.notSpecified}</p>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold">Month</label>
                    <input
                        type="month"
                        className="border rounded px-2 py-1"
                        value={monthValue}
                        onChange={handleMonthChange}
                    />
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded border bg-green-100 border-green-300 text-green-800">Present</span>
                    <span className="px-2 py-1 rounded border bg-red-100 border-red-300 text-red-800">Absent</span>
                    <span className="px-2 py-1 rounded border bg-slate-100 border-slate-300 text-slate-700">Not Specified</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEK_DAYS.map((weekday) => (
                    <div key={weekday} className="text-xs font-bold text-center text-slate-600">{weekday}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
                {calendarCells.map((cell) => {
                    const dayLogs = attendanceCalendarMap[cell.dateKey] || []
                    const presentCount = dayLogs.filter((log) => log.status === "Present").length
                    const absentCount = dayLogs.filter((log) => log.status === "Absent").length
                    const unspecifiedCount = dayLogs.filter((log) => log.status !== "Present" && log.status !== "Absent").length

                    const toneClass = absentCount > 0 && presentCount === 0
                        ? "bg-red-100 border-red-300"
                        : presentCount > 0 && absentCount === 0
                            ? "bg-green-100 border-green-300"
                            : presentCount > 0 && absentCount > 0
                                ? "bg-yellow-100 border-yellow-300"
                                : unspecifiedCount > 0
                                    ? "bg-slate-100 border-slate-300"
                                    : "bg-white border-slate-200"

                    return (
                        <button
                            type="button"
                            key={cell.dateKey}
                            onClick={() => setSelectedDate(cell.dateKey)}
                            className={`min-h-24 rounded border p-2 text-left transition hover:shadow-sm ${toneClass} ${!cell.inCurrentMonth ? "opacity-40" : ""} ${selectedDate === cell.dateKey ? "ring-2 ring-blue-600" : ""}`}
                        >
                            <p className="text-xs font-bold mb-1">{cell.dayLabel}</p>
                            <p className="text-[11px] text-green-700 font-semibold">P: {presentCount}</p>
                            <p className="text-[11px] text-red-700 font-semibold">A: {absentCount}</p>
                            <p className="text-[11px] text-slate-600">N: {unspecifiedCount}</p>
                        </button>
                    )
                })}
            </div>

            <div className="border rounded p-3 mb-4">
                <p className="font-semibold mb-2">Attendance on {formatDate(selectedDate)}</p>
                {selectedDateAttendance.length === 0 ? (
                    <p className="text-sm text-slate-600">No attendance logs found on this date.</p>
                ) : (
                    <div className="space-y-2">
                        {selectedDateAttendance.map((entry) => (
                            <div key={`${entry.attendanceID}-${entry.employeeName}`} className={`rounded border px-2 py-2 text-sm ${attendanceStatusClasses(entry.status)}`}>
                                <p className="font-semibold">{entry.employeeName}</p>
                                <p>Status: {entry.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="font-semibold mb-2">Attendance Profiles</p>
            {(data || []).map((item) => (
                <div key={item._id} className="border rounded p-3 mb-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.employee ? `${item.employee.firstname} ${item.employee.lastname}` : "Employee"}</p>
                        <p>Status: {item.status}</p>
                        <p>Logs: {(item.attendancelog || []).length}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteAttendance(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRRecruitmentPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/recruitment/all")
    const [departments, setDepartments] = useState([])
    const [applicants, setApplicants] = useState([])
    const [supportingLoading, setSupportingLoading] = useState(false)
    const [applicantLookupError, setApplicantLookupError] = useState("")
    const [message, setMessage] = useState("")
    const [createForm, setCreateForm] = useState({
        jobtitle: "",
        description: "",
        departmentID: "",
    })
    const [editForms, setEditForms] = useState({})
    const [assignSelections, setAssignSelections] = useState({})

    const fetchSupportingData = async () => {
        setSupportingLoading(true)
        setApplicantLookupError("")

        const [departmentResult, applicantResult] = await Promise.allSettled([
            apiService.get("/api/v1/department/all", { withCredentials: true }),
            apiService.get("/api/v1/applicant/all", { withCredentials: true }),
        ])

        if (departmentResult.status === "fulfilled") {
            setDepartments(departmentResult.value.data?.data || [])
        }

        if (applicantResult.status === "fulfilled") {
            setApplicants(applicantResult.value.data?.data || [])
        } else {
            setApplicants([])
            const fallbackError = applicantResult.reason?.response?.data?.message || applicantResult.reason?.message
            setApplicantLookupError(fallbackError || "Applicants fetch failed.")
        }

        setSupportingLoading(false)
    }

    useEffect(() => {
        fetchSupportingData()
    }, [])

    useEffect(() => {
        const mappedForms = {}
        for (let index = 0; index < (data || []).length; index++) {
            const item = data[index]
            mappedForms[item._id] = {
                jobtitle: item.jobtitle || "",
                description: item.description || "",
                departmentID: item?.department?._id || "",
            }
        }
        setEditForms(mappedForms)
    }, [data])

    const toggleAssignSelection = (recruitmentID, applicantID) => {
        setAssignSelections((prev) => {
            const current = prev[recruitmentID] || []
            const alreadySelected = current.includes(applicantID)
            const next = alreadySelected
                ? current.filter((id) => id !== applicantID)
                : [...current, applicantID]
            return { ...prev, [recruitmentID]: next }
        })
    }

    const createRecruitment = async (e) => {
        e.preventDefault()
        try {
            setMessage("")
            await apiService.post("/api/v1/recruitment/create-recruitment", {
                jobtitle: createForm.jobtitle,
                description: createForm.description,
                departmentID: createForm.departmentID || undefined,
            }, { withCredentials: true })
            setCreateForm({ jobtitle: "", description: "", departmentID: "" })
            setMessage("Recruitment created successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Recruitment creation failed")
        }
    }

    const updateRecruitmentDetails = async (recruitmentID) => {
        const form = editForms[recruitmentID]
        if (!form?.jobtitle || !form?.description) {
            setMessage("Job title and description are required for update.")
            return
        }

        try {
            setMessage("")
            await apiService.patch("/api/v1/recruitment/update-recruitment", {
                recruitmentID,
                jobtitle: form.jobtitle,
                description: form.description,
                departmentID: form.departmentID,
            }, { withCredentials: true })
            setMessage("Recruitment updated successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Recruitment update failed")
        }
    }

    const assignApplicantsToRecruitment = async (recruitmentID) => {
        const currentRecruitment = (data || []).find((item) => String(item._id) === String(recruitmentID))
        const alreadyAssignedSet = new Set((currentRecruitment?.application || []).map((applicant) => String(applicant._id)))
        const selectedApplicantIDs = (assignSelections[recruitmentID] || []).filter(
            (applicantID) => !alreadyAssignedSet.has(String(applicantID))
        )

        if (selectedApplicantIDs.length === 0) {
            setMessage("Select at least one applicant to assign.")
            return
        }

        try {
            setMessage("")
            const response = await apiService.patch("/api/v1/recruitment/update-recruitment", {
                recruitmentID,
                applicationIDArray: selectedApplicantIDs,
            }, { withCredentials: true })

            const addedApplicants = response.data?.assignmentSummary?.addedApplicants ?? selectedApplicantIDs.length
            const skippedApplicants = response.data?.assignmentSummary?.skippedApplicants?.length || 0
            setAssignSelections((prev) => ({ ...prev, [recruitmentID]: [] }))
            setMessage(
                skippedApplicants > 0
                    ? `Applicants assigned. Added ${addedApplicants}, skipped ${skippedApplicants}.`
                    : "Applicants assigned successfully."
            )
            fetchData()
            fetchSupportingData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Applicant assignment failed")
        }
    }

    const deleteRecruitment = async (recruitmentID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/recruitment/delete-recruitment/${recruitmentID}`, { withCredentials: true })
            setMessage("Recruitment deleted successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Recruitment">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}
            {applicantLookupError ? <p className="font-bold text-red-700 mb-3">{applicantLookupError}</p> : null}

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-slate-800"
                    onClick={fetchSupportingData}
                    disabled={supportingLoading}
                >
                    {supportingLoading ? "Refreshing..." : "Refresh Applicants"}
                </button>
                <p className="text-sm text-gray-700">Fetched applicants: {applicants.length}</p>
            </div>

            <form onSubmit={createRecruitment} className="grid grid-cols-1 lg:grid-cols-4 gap-2 border-b pb-3 mb-3">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Job Title"
                    value={createForm.jobtitle}
                    onChange={(e) => setCreateForm({ ...createForm, jobtitle: e.target.value })}
                    required
                />
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                />
                <select
                    className="border rounded px-2 py-1"
                    value={createForm.departmentID}
                    onChange={(e) => setCreateForm({ ...createForm, departmentID: e.target.value })}
                >
                    <option value="">Select Department (Optional)</option>
                    {departments.map((department) => (
                        <option key={department._id} value={department._id}>{department.name}</option>
                    ))}
                </select>
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Create Recruitment
                </button>
            </form>

            {(data || []).length === 0 ? <p>No recruitment records found.</p> : null}
            {(data || []).map((item) => {
                const assignedApplicantIDSet = new Set((item.application || []).map((assigned) => String(assigned._id)))
                const selectedIDs = (assignSelections[item._id] || []).filter(
                    (applicantID) => !assignedApplicantIDSet.has(String(applicantID))
                )
                const selectableApplicantsCount = applicants.filter(
                    (applicant) => !assignedApplicantIDSet.has(String(applicant._id))
                ).length

                return (
                    <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                        <div className="flex justify-between gap-3">
                            <div>
                                <p className="font-bold text-lg">{item.jobtitle}</p>
                                <p className="text-sm text-gray-700">Department: {item?.department?.name || "-"}</p>
                                <p className="text-sm text-gray-700">Created: {formatDate(item.createdAt)}</p>
                            </div>
                            <ActionButton label="Delete" onClick={() => deleteRecruitment(item._id)} />
                        </div>
                        <div>
                            <p className="text-sm">{item.description}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Assigned Applicants</p>
                            {(item.application || []).length === 0 ? (
                                <p className="text-sm text-gray-600">No applicants assigned yet.</p>
                            ) : (
                                <div className="text-sm">
                                    {(item.application || []).map((applicant) => (
                                        <p key={applicant._id}>
                                            {personName(applicant)} | {applicant.appliedrole || "-"} | {applicant.recruitmentstatus || "-"}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                            <input
                                className="border rounded px-2 py-1"
                                value={editForms[item._id]?.jobtitle || ""}
                                onChange={(e) => setEditForms((prev) => ({
                                    ...prev,
                                    [item._id]: { ...prev[item._id], jobtitle: e.target.value },
                                }))}
                                placeholder="Job Title"
                            />
                            <input
                                className="border rounded px-2 py-1"
                                value={editForms[item._id]?.description || ""}
                                onChange={(e) => setEditForms((prev) => ({
                                    ...prev,
                                    [item._id]: { ...prev[item._id], description: e.target.value },
                                }))}
                                placeholder="Description"
                            />
                            <select
                                className="border rounded px-2 py-1"
                                value={editForms[item._id]?.departmentID || ""}
                                onChange={(e) => setEditForms((prev) => ({
                                    ...prev,
                                    [item._id]: { ...prev[item._id], departmentID: e.target.value },
                                }))}
                            >
                                <option value="">Select Department</option>
                                {departments.map((department) => (
                                    <option key={department._id} value={department._id}>{department.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                                onClick={() => updateRecruitmentDetails(item._id)}
                            >
                                Update Details
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                            <div className="border rounded p-2">
                                <p className="text-sm font-semibold mb-2">Select Applicants</p>
                                <div className="max-h-28 overflow-auto space-y-2">
                                    {applicants.length === 0 ? (
                                        <p className="text-xs text-gray-600">No applicants found. Create from Applicants module or Careers Apply page.</p>
                                    ) : selectableApplicantsCount === 0 ? (
                                        <p className="text-xs text-gray-600">All fetched applicants are already assigned to this recruitment.</p>
                                    ) : (
                                        applicants.map((applicant) => {
                                            const isAlreadyAssigned = assignedApplicantIDSet.has(String(applicant._id))
                                            return (
                                            <label key={applicant._id} className="flex items-start gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAlreadyAssigned || selectedIDs.includes(applicant._id)}
                                                    disabled={isAlreadyAssigned}
                                                    onChange={() => toggleAssignSelection(item._id, applicant._id)}
                                                />
                                                <span className={isAlreadyAssigned ? "text-gray-500" : ""}>
                                                    {personName(applicant)} | {applicant.appliedrole || "-"} {isAlreadyAssigned ? "(Already assigned)" : ""}
                                                </span>
                                            </label>
                                        )})
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center">
                                Selected applicants: {selectedIDs.length}
                            </div>
                            <button
                                type="button"
                                className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={() => assignApplicantsToRecruitment(item._id)}
                                disabled={selectedIDs.length === 0}
                            >
                                Assign Applicants
                            </button>
                        </div>
                    </div>
                )
            })}
        </ModuleLayout>
    )
}

export const HRApplicantsPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/applicant/all")
    const [recruitments, setRecruitments] = useState([])
    const [message, setMessage] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [search, setSearch] = useState("")
    const [createForm, setCreateForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        appliedrole: "",
    })
    const [editForms, setEditForms] = useState({})

    const fetchRecruitments = async () => {
        try {
            const response = await apiService.get("/api/v1/recruitment/all", { withCredentials: true })
            setRecruitments(response.data?.data || [])
        } catch {
            // Applicant management works even if recruitment dropdown fails.
        }
    }

    useEffect(() => {
        fetchRecruitments()
    }, [])

    useEffect(() => {
        const forms = {}
        for (let index = 0; index < (data || []).length; index++) {
            const applicant = data[index]
            forms[applicant._id] = {
                firstname: applicant.firstname || "",
                lastname: applicant.lastname || "",
                email: applicant.email || "",
                contactnumber: applicant.contactnumber || "",
                appliedrole: applicant.appliedrole || "",
                recruitmentstatus: applicant.recruitmentstatus || "Pending",
                assignRecruitmentID: "",
            }
        }
        setEditForms(forms)
    }, [data])

    const filteredApplicants = useMemo(() => {
        const applicants = data || []
        return applicants.filter((item) => {
            const query = search.trim().toLowerCase()
            const matchesSearch = !query || `${item.firstname} ${item.lastname} ${item.email} ${item.appliedrole}`.toLowerCase().includes(query)
            const matchesStatus = statusFilter === "All" || item.recruitmentstatus === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [data, search, statusFilter])

    const createApplicant = async (e) => {
        e.preventDefault()
        try {
            setMessage("")
            await apiService.post("/api/v1/applicant/create-applicant", createForm, { withCredentials: true })
            setCreateForm({
                firstname: "",
                lastname: "",
                email: "",
                contactnumber: "",
                appliedrole: "",
            })
            setMessage("Applicant created successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Applicant creation failed")
        }
    }

    const updateApplicant = async (applicantID) => {
        const form = editForms[applicantID]
        if (!form) return

        try {
            setMessage("")
            await apiService.patch("/api/v1/applicant/update-applicant", {
                applicantID,
                UpdatedData: {
                    firstname: form.firstname,
                    lastname: form.lastname,
                    email: form.email,
                    contactnumber: form.contactnumber,
                    appliedrole: form.appliedrole,
                    recruitmentstatus: form.recruitmentstatus,
                },
            }, { withCredentials: true })
            setMessage("Applicant updated successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Applicant update failed")
        }
    }

    const assignApplicantToRecruitment = async (applicantID) => {
        const form = editForms[applicantID]
        const recruitmentID = form?.assignRecruitmentID

        if (!recruitmentID) {
            setMessage("Please select a recruitment before assigning.")
            return
        }

        try {
            setMessage("")
            await apiService.patch("/api/v1/recruitment/update-recruitment", {
                recruitmentID,
                applicationIDArray: [applicantID],
            }, { withCredentials: true })

            await apiService.patch("/api/v1/applicant/update-applicant", {
                applicantID,
                UpdatedData: { recruitmentstatus: "Conduct-Interview" },
            }, { withCredentials: true })

            setMessage("Applicant assigned to recruitment successfully.")
            fetchData()
            fetchRecruitments()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Applicant assignment failed")
        }
    }

    const deleteApplicant = async (applicantID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/applicant/delete-applicant/${applicantID}`, { withCredentials: true })
            setMessage("Applicant deleted successfully.")
            fetchData()
            fetchRecruitments()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Applicant delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Applicants">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}

            <form onSubmit={createApplicant} className="grid grid-cols-1 lg:grid-cols-6 gap-2 border-b pb-3 mb-3">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="First Name"
                    value={createForm.firstname}
                    onChange={(e) => setCreateForm({ ...createForm, firstname: e.target.value })}
                    required
                />
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Last Name"
                    value={createForm.lastname}
                    onChange={(e) => setCreateForm({ ...createForm, lastname: e.target.value })}
                    required
                />
                <input
                    type="email"
                    className="border rounded px-2 py-1"
                    placeholder="Email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                />
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Contact Number"
                    value={createForm.contactnumber}
                    onChange={(e) => setCreateForm({ ...createForm, contactnumber: e.target.value })}
                    required
                />
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Applied Role"
                    value={createForm.appliedrole}
                    onChange={(e) => setCreateForm({ ...createForm, appliedrole: e.target.value })}
                    required
                />
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Add Applicant
                </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-3">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Search applicant"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Conduct-Interview">Conduct-Interview</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Not Specified">Not Specified</option>
                </select>
            </div>

            {filteredApplicants.length === 0 ? <p>No applicants found.</p> : null}
            {filteredApplicants.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                        <div>
                            <p className="font-bold">{personName(item)}</p>
                            <p className="text-sm">{item.email}</p>
                            <p className="text-sm">Applied Role: {item.appliedrole}</p>
                            <p className="text-sm">Status: {item.recruitmentstatus}</p>
                        </div>
                        <ActionButton label="Delete" onClick={() => deleteApplicant(item._id)} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.firstname || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], firstname: e.target.value },
                            }))}
                            placeholder="First Name"
                        />
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.lastname || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], lastname: e.target.value },
                            }))}
                            placeholder="Last Name"
                        />
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.contactnumber || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], contactnumber: e.target.value },
                            }))}
                            placeholder="Contact Number"
                        />
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.appliedrole || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], appliedrole: e.target.value },
                            }))}
                            placeholder="Applied Role"
                        />
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.recruitmentstatus || "Pending"}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], recruitmentstatus: e.target.value },
                            }))}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Conduct-Interview">Conduct-Interview</option>
                            <option value="Interview Completed">Interview Completed</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Not Specified">Not Specified</option>
                        </select>
                        <button
                            type="button"
                            className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateApplicant(item._id)}
                        >
                            Update Applicant
                        </button>
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.assignRecruitmentID || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], assignRecruitmentID: e.target.value },
                            }))}
                        >
                            <option value="">Select Recruitment</option>
                            {recruitments.map((recruitment) => (
                                <option key={recruitment._id} value={recruitment._id}>{recruitment.jobtitle}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <button
                            type="button"
                            className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
                            onClick={() => assignApplicantToRecruitment(item._id)}
                        >
                            Assign To Recruitment
                        </button>
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRInterviewInsightsPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/interview-insights/all")
    const [applicants, setApplicants] = useState([])
    const [interviewers, setInterviewers] = useState([])
    const [message, setMessage] = useState("")
    const [createForm, setCreateForm] = useState({
        applicantID: "",
        interviewerID: "",
    })
    const [editForms, setEditForms] = useState({})

    const fetchSupportingData = async () => {
        try {
            const [applicantResponse, interviewerResponse] = await Promise.all([
                apiService.get("/api/v1/applicant/all", { withCredentials: true }),
                apiService.get("/api/v1/HR/all", { withCredentials: true }),
            ])

            setApplicants(applicantResponse.data?.data || [])
            setInterviewers(interviewerResponse.data?.data || [])
        } catch {
            // Existing interview rows are still visible if lookup data fails.
        }
    }

    useEffect(() => {
        fetchSupportingData()
    }, [])

    useEffect(() => {
        const mappedForms = {}
        for (let index = 0; index < (data || []).length; index++) {
            const item = data[index]
            mappedForms[item._id] = {
                status: item.status || "Pending",
                feedback: item.feedback || "",
                interviewerID: item?.interviewer?._id || "",
                interviewdate: item.interviewdate ? new Date(item.interviewdate).toISOString().split("T")[0] : "",
                responsedate: item.responsedate ? new Date(item.responsedate).toISOString().split("T")[0] : "",
            }
        }
        setEditForms(mappedForms)
    }, [data])

    const createInterview = async (e) => {
        e.preventDefault()
        try {
            setMessage("")
            await apiService.post("/api/v1/interview-insights/create-interview", createForm, { withCredentials: true })
            setCreateForm({ applicantID: "", interviewerID: "" })
            setMessage("Interview record created successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Interview creation failed")
        }
    }

    const updateInterview = async (interviewID) => {
        const form = editForms[interviewID]
        if (!form) return

        try {
            setMessage("")
            await apiService.patch("/api/v1/interview-insights/update-interview", {
                interviewID,
                UpdatedData: {
                    status: form.status,
                    feedback: form.feedback,
                    interviewer: form.interviewerID,
                    interviewdate: form.interviewdate || null,
                    responsedate: form.responsedate || null,
                },
            }, { withCredentials: true })
            setMessage("Interview record updated successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Interview update failed")
        }
    }

    const deleteInterview = async (interviewID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/interview-insights/delete-interview/${interviewID}`, { withCredentials: true })
            setMessage("Interview record deleted successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Interview Insights">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}

            <form onSubmit={createInterview} className="grid grid-cols-1 lg:grid-cols-3 gap-2 border-b pb-3 mb-3">
                <select
                    className="border rounded px-2 py-1"
                    value={createForm.applicantID}
                    onChange={(e) => setCreateForm({ ...createForm, applicantID: e.target.value })}
                    required
                >
                    <option value="">Select Applicant</option>
                    {applicants.map((applicant) => (
                        <option key={applicant._id} value={applicant._id}>
                            {personName(applicant)} | {applicant.appliedrole}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded px-2 py-1"
                    value={createForm.interviewerID}
                    onChange={(e) => setCreateForm({ ...createForm, interviewerID: e.target.value })}
                    required
                >
                    <option value="">Select Interviewer</option>
                    {interviewers.map((interviewer) => (
                        <option key={interviewer._id} value={interviewer._id}>
                            {personName(interviewer)} | {interviewer.role}
                        </option>
                    ))}
                </select>
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Create Interview
                </button>
            </form>

            {(data || []).length === 0 ? <p>No interview records found.</p> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                        <div>
                            <p className="font-bold">Applicant: {personName(item.applicant)}</p>
                            <p className="text-sm">Role: {item?.applicant?.appliedrole || "-"}</p>
                            <p className="text-sm">Current Interviewer: {personName(item.interviewer)}</p>
                            <p className="text-sm">Status: {item.status}</p>
                        </div>
                        <ActionButton label="Delete" onClick={() => deleteInterview(item._id)} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.status || "Pending"}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], status: e.target.value },
                            }))}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Canceled">Canceled</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.interviewerID || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], interviewerID: e.target.value },
                            }))}
                        >
                            <option value="">Select Interviewer</option>
                            {interviewers.map((interviewer) => (
                                <option key={interviewer._id} value={interviewer._id}>
                                    {personName(interviewer)}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.interviewdate || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], interviewdate: e.target.value },
                            }))}
                        />
                        <input
                            type="date"
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.responsedate || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], responsedate: e.target.value },
                            }))}
                        />
                        <button
                            type="button"
                            className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateInterview(item._id)}
                        >
                            Update Interview
                        </button>
                    </div>

                    <textarea
                        className="border rounded px-2 py-1 min-h-20"
                        placeholder="Feedback"
                        value={editForms[item._id]?.feedback || ""}
                        onChange={(e) => setEditForms((prev) => ({
                            ...prev,
                            [item._id]: { ...prev[item._id], feedback: e.target.value },
                        }))}
                    />

                    <div className="text-xs text-gray-600">
                        Interview Date: {formatDate(item.interviewdate)} | Response Date: {formatDate(item.responsedate)}
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRRequestsPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/generate-request/all")
    const [message, setMessage] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const filteredRequests = useMemo(() => {
        const allRequests = data || []
        if (statusFilter === "All") {
            return allRequests
        }
        return allRequests.filter((item) => item.status === statusFilter)
    }, [data, statusFilter])

    const updateRequestStatus = async (requestID, status) => {
        try {
            setMessage("")
            await apiService.patch("/api/v1/generate-request/update-request-status", {
                requestID,
                status,
            }, { withCredentials: true })
            setMessage(`Request marked as ${status}.`)
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Status update failed")
        }
    }

    const deleteRequest = async (requestID) => {
        try {
            setMessage("")
            await apiService.delete(`/api/v1/generate-request/delete-request/${requestID}`, { withCredentials: true })
            setMessage("Request deleted successfully.")
            fetchData()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Requests">
            {error ? <ErrorText message={error} /> : null}
            {message ? <p className="font-bold text-blue-700 mb-3">{message}</p> : null}

            <div className="flex gap-2 items-center mb-3">
                <label className="font-semibold">Filter:</label>
                <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                </select>
            </div>

            {filteredRequests.length === 0 ? <p>No requests found.</p> : null}
            {filteredRequests.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3 flex flex-col gap-2">
                    <div>
                        <p className="font-bold">{item.requesttitle}</p>
                        <p>{item.requestconent}</p>
                        <p className="text-sm text-gray-700">
                            Employee: {personName(item.employee)} | Department: {item?.department?.name || "-"}
                        </p>
                        <p className="text-sm text-gray-700">
                            Status: {item.status} | Approved By: {personName(item.approvedby)}
                        </p>
                        <p className="text-xs text-gray-600">
                            Requested: {formatDate(item.createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateRequestStatus(item._id, "Approved")}
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-yellow-700 text-white rounded hover:bg-yellow-800"
                            onClick={() => updateRequestStatus(item._id, "Pending")}
                        >
                            Mark Pending
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
                            onClick={() => updateRequestStatus(item._id, "Denied")}
                        >
                            Deny
                        </button>
                        <ActionButton label="Delete" onClick={() => deleteRequest(item._id)} />
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRProfilesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/HR/all")

    const deleteHR = async (hrid) => {
        try {
            await apiService.delete(`/api/v1/HR/delete-HR/${hrid}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="HR Profiles">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.firstname} {item.lastname}</p>
                        <p>{item.email}</p>
                        <p>{item.role}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteHR(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}
