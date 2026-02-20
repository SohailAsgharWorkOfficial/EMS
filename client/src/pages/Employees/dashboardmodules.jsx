import { useEffect, useMemo, useState } from "react"
import { apiService } from "../../redux/apis/APIService"
import { Loading } from "../../components/common/loading.jsx"

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const pad2 = (value) => String(value).padStart(2, "0")

const toDateKey = (value) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

const today = () => toDateKey(new Date())

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
    return "bg-slate-100 border-slate-300 text-slate-700"
}

const attendanceStatusClasses = (status) => {
    if (status === "Present") return "bg-green-200 border-green-400 text-green-900"
    if (status === "Absent") return "bg-red-200 border-red-400 text-red-900"
    return "bg-slate-100 border-slate-300 text-slate-700"
}

const useEmployeeData = () => {
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchEmployee = async () => {
        try {
            setLoading(true)
            setError("")
            await apiService.get("/api/auth/employee/check-login")
            const response = await apiService.get("/api/v1/employee/by-employee")
            setEmployee(response.data?.data || null)
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to load employee data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployee()
    }, [])

    return { employee, loading, error, fetchEmployee }
}

const ModuleLayout = ({ title, children }) => (
    <div className="w-full mx-auto my-8 flex flex-col gap-5 h-[94%]">
        <h1 className="min-[250px]:text-2xl md:text-4xl font-bold">{title}</h1>
        <div className="border-2 border-blue-700 rounded-lg p-3 overflow-auto h-full bg-white">
            {children}
        </div>
    </div>
)

const CountCard = ({ label, value }) => (
    <div className="border-2 border-blue-700 rounded-lg p-3 bg-white">
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-2xl font-bold text-blue-800">{value}</p>
    </div>
)

const formatDate = (value) => {
    if (!value) return "-"
    try {
        return new Date(value).toLocaleDateString()
    } catch {
        return "-"
    }
}

const formatCurrency = (value, currency = "PKR") => {
    const number = Number(value)
    if (!Number.isFinite(number)) return `0 ${currency}`
    return `${number.toLocaleString()} ${currency}`
}

export const EmployeeDashboardHome = () => {
    const { employee, loading, error } = useEmployeeData()
    const [extraCounts, setExtraCounts] = useState({ recruitment: 0, interviews: 0 })

    useEffect(() => {
        const fetchExtraCounts = async () => {
            const [recruitmentResult, interviewResult] = await Promise.allSettled([
                apiService.get("/api/v1/recruitment/employee/all"),
                apiService.get("/api/v1/interview-insights/employee/all"),
            ])

            const recruitmentCount = recruitmentResult.status === "fulfilled"
                ? (recruitmentResult.value.data?.data || []).length
                : 0

            const interviewCount = interviewResult.status === "fulfilled"
                ? (interviewResult.value.data?.data || []).length
                : 0

            setExtraCounts({ recruitment: recruitmentCount, interviews: interviewCount })
        }

        fetchExtraCounts()
    }, [])

    const counts = useMemo(() => ({
        notices: employee?.notice?.length || 0,
        salaries: employee?.salary?.length || 0,
        leaves: employee?.leaverequest?.length || 0,
        requests: employee?.generaterequest?.length || 0,
        attendances: employee?.attendance?.attendancelog?.length || 0,
        recruitment: extraCounts.recruitment,
        interviews: extraCounts.interviews,
    }), [employee, extraCounts])

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Dashboard">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            <p className="text-sm md:text-base text-gray-700 mb-4">
                {employee ? `${employee.firstname} ${employee.lastname}` : "Employee"}
                {employee?.department?.name ? ` | Department: ${employee.department.name}` : ""}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <CountCard label="Notices" value={counts.notices} />
                <CountCard label="Salary Records" value={counts.salaries} />
                <CountCard label="Leave Requests" value={counts.leaves} />
                <CountCard label="Attendance Logs" value={counts.attendances} />
                <CountCard label="Open Recruitments" value={counts.recruitment} />
                <CountCard label="Interview Records" value={counts.interviews} />
                <CountCard label="Requests" value={counts.requests} />
            </div>
        </ModuleLayout>
    )
}

export const EmployeeSalariesPage = () => {
    const { employee, loading, error } = useEmployeeData()
    const [statusFilter, setStatusFilter] = useState("All")
    const [sortBy, setSortBy] = useState("duedate_desc")

    const salaryData = useMemo(() => {
        const records = [...(employee?.salary || [])]

        if (statusFilter !== "All") {
            records.splice(0, records.length, ...records.filter((item) => item.status === statusFilter))
        }

        records.sort((a, b) => {
            if (sortBy === "duedate_asc") {
                return new Date(a.duedate) - new Date(b.duedate)
            }
            if (sortBy === "paymentdate_desc") {
                return new Date(b.paymentdate || 0) - new Date(a.paymentdate || 0)
            }
            return new Date(b.duedate) - new Date(a.duedate)
        })

        return records
    }, [employee?.salary, statusFilter, sortBy])

    const salarySummary = useMemo(() => {
        const allRecords = employee?.salary || []
        const totalEarned = allRecords
            .filter((item) => item.status === "Paid")
            .reduce((sum, item) => sum + (Number(item.netpay) || 0), 0)
        const pendingAmount = allRecords
            .filter((item) => item.status === "Pending" || item.status === "Delayed")
            .reduce((sum, item) => sum + (Number(item.netpay) || 0), 0)

        return {
            totalRecords: allRecords.length,
            paidCount: allRecords.filter((item) => item.status === "Paid").length,
            pendingCount: allRecords.filter((item) => item.status === "Pending").length,
            delayedCount: allRecords.filter((item) => item.status === "Delayed").length,
            totalEarned,
            pendingAmount,
        }
    }, [employee?.salary])

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Salaries">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Salary Records</p>
                    <p className="font-bold">{salarySummary.totalRecords}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Paid Records</p>
                    <p className="font-bold">{salarySummary.paidCount}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Received</p>
                    <p className="font-bold">{formatCurrency(salarySummary.totalEarned)}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Pending + Delayed</p>
                    <p className="font-bold">{formatCurrency(salarySummary.pendingAmount)}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
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
                <select
                    className="border rounded px-2 py-1"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="duedate_desc">Sort: Due Date (Latest)</option>
                    <option value="duedate_asc">Sort: Due Date (Oldest)</option>
                    <option value="paymentdate_desc">Sort: Payment Date</option>
                </select>
            </div>

            {salaryData.length === 0 ? <p>No salary records found.</p> : null}
            {salaryData.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3">
                    <p className="font-bold">Net Pay: {formatCurrency(item.netpay, item.currency)}</p>
                    <p>Basic: {formatCurrency(item.basicpay, item.currency)} | Bonus: {formatCurrency(item.bonuses, item.currency)} | Deduction: {formatCurrency(item.deductions, item.currency)}</p>
                    <p>Due Date: {formatDate(item.duedate)}</p>
                    <p>Payment Date: {formatDate(item.paymentdate)}</p>
                    <p>Status: {item.status}</p>
                    {item.status === "Delayed" ? (
                        <p className="text-xs text-red-700 font-semibold">HR is expected to process this salary soon.</p>
                    ) : null}
                    {item.status === "Pending" ? (
                        <p className="text-xs text-yellow-700 font-semibold">This salary record is pending for payment.</p>
                    ) : null}
                    {item.status === "Paid" ? (
                        <p className="text-xs text-green-700 font-semibold">Salary has been paid successfully.</p>
                    ) : null}
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeNoticesPage = () => {
    const { employee, loading, error } = useEmployeeData()
    const [search, setSearch] = useState("")
    const [audienceFilter, setAudienceFilter] = useState("All")

    const notices = useMemo(() => employee?.notice || [], [employee?.notice])

    const noticeSummary = useMemo(() => ({
        total: notices.length,
        departmentSpecific: notices.filter((item) => item.audience === "Department-Specific").length,
        employeeSpecific: notices.filter((item) => item.audience === "Employee-Specific").length,
    }), [notices])

    const filteredNotices = useMemo(() => {
        return notices.filter((item) => {
            const matchesAudience = audienceFilter === "All" || item.audience === audienceFilter
            const searchText = `${item.title || ""} ${item.content || ""} ${item.audience || ""}`.toLowerCase()
            const matchesSearch = searchText.includes(search.toLowerCase().trim())
            return matchesAudience && matchesSearch
        })
    }, [notices, audienceFilter, search])

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Issue Notices">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Notices</p>
                    <p className="font-bold">{noticeSummary.total}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Department Specific</p>
                    <p className="font-bold">{noticeSummary.departmentSpecific}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Employee Specific</p>
                    <p className="font-bold">{noticeSummary.employeeSpecific}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                <input
                    className="border rounded px-2 py-1 min-w-52"
                    placeholder="Search notices"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="border rounded px-2 py-1"
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                >
                    <option value="All">All Audiences</option>
                    <option value="Department-Specific">Department-Specific</option>
                    <option value="Employee-Specific">Employee-Specific</option>
                </select>
            </div>

            {filteredNotices.length === 0 ? <p>No notices found.</p> : null}
            {filteredNotices.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3">
                    <p className="font-bold">{item.title}</p>
                    <p>{item.content}</p>
                    <p className="text-sm">Audience: {item.audience}</p>
                    <p className="text-sm">Date: {formatDate(item.createdAt)}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeLeavesPage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [form, setForm] = useState({ title: "", reason: "", startdate: "", enddate: "" })
    const [message, setMessage] = useState("")
    const [monthValue, setMonthValue] = useState(monthValueFromDate())
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))

    const leaveRequests = useMemo(() => employee?.leaverequest || [], [employee?.leaverequest])

    const leaveSummary = useMemo(() => ({
        total: leaveRequests.length,
        approved: leaveRequests.filter((item) => item.status === "Approved").length,
        pending: leaveRequests.filter((item) => item.status === "Pending").length,
        rejected: leaveRequests.filter((item) => item.status === "Rejected").length,
    }), [leaveRequests])

    const calendarCells = useMemo(() => buildCalendarCells(monthValue), [monthValue])

    const leaveCalendarMap = useMemo(() => {
        const mapped = {}
        for (let index = 0; index < leaveRequests.length; index++) {
            const leave = leaveRequests[index]
            forEachDateInRange(leave.startdate, leave.enddate, (dateKey) => {
                if (!dateKey.startsWith(monthValue)) return
                if (!mapped[dateKey]) mapped[dateKey] = []
                mapped[dateKey].push({
                    leaveID: leave._id,
                    title: leave.title,
                    reason: leave.reason,
                    status: leave.status || "Pending",
                })
            })
        }
        return mapped
    }, [leaveRequests, monthValue])

    const selectedDateLeaves = useMemo(() => leaveCalendarMap[selectedDate] || [], [leaveCalendarMap, selectedDate])

    const handleMonthChange = (e) => {
        const nextMonth = e.target.value
        setMonthValue(nextMonth)
        const todayKey = toDateKey(new Date())
        setSelectedDate(todayKey.startsWith(nextMonth) ? todayKey : `${nextMonth}-01`)
    }

    const createLeave = async (e) => {
        e.preventDefault()
        if (!employee?._id) return
        try {
            setMessage("")
            await apiService.post("/api/v1/leave/create-leave", { employeeID: employee._id, ...form })
            setMessage("Leave request submitted.")
            setForm({ title: "", reason: "", startdate: "", enddate: "" })
            fetchEmployee()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Leave request failed")
        }
    }

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Leaves">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {message ? <p className="font-bold text-blue-700">{message}</p> : null}
            <form onSubmit={createLeave} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <input className="border rounded px-2 py-1" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <input className="border rounded px-2 py-1" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                <input type="date" className="border rounded px-2 py-1" value={form.startdate} onChange={(e) => setForm({ ...form, startdate: e.target.value })} required />
                <input type="date" className="border rounded px-2 py-1" value={form.enddate} onChange={(e) => setForm({ ...form, enddate: e.target.value })} required />
                <button type="submit" className="w-fit px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Submit Leave</button>
            </form>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Requests</p>
                    <p className="font-bold">{leaveSummary.total}</p>
                </div>
                <div className="border rounded p-2 bg-green-50">
                    <p className="text-xs text-green-700">Approved</p>
                    <p className="font-bold text-green-700">{leaveSummary.approved}</p>
                </div>
                <div className="border rounded p-2 bg-yellow-50">
                    <p className="text-xs text-yellow-700">Pending</p>
                    <p className="font-bold text-yellow-700">{leaveSummary.pending}</p>
                </div>
                <div className="border rounded p-2 bg-red-50">
                    <p className="text-xs text-red-700">Rejected</p>
                    <p className="font-bold text-red-700">{leaveSummary.rejected}</p>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold">Month</label>
                    <input type="month" className="border rounded px-2 py-1" value={monthValue} onChange={handleMonthChange} />
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
                    <p className="text-sm text-slate-600">No leave entries on this date.</p>
                ) : (
                    <div className="space-y-2">
                        {selectedDateLeaves.map((entry) => (
                            <div key={entry.leaveID} className={`rounded border px-2 py-2 text-sm ${leaveStatusClasses(entry.status)}`}>
                                <p className="font-semibold">{entry.title}</p>
                                <p>{entry.reason}</p>
                                <p>Status: {entry.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModuleLayout>
    )
}

export const EmployeeAttendancePage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [status, setStatus] = useState("Present")
    const [message, setMessage] = useState("")
    const [monthValue, setMonthValue] = useState(monthValueFromDate())
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))

    const attendanceRecord = typeof employee?.attendance === "object" ? employee.attendance : null
    const attendanceID = attendanceRecord?._id || employee?.attendance || ""

    const attendanceLogs = useMemo(() => attendanceRecord?.attendancelog || [], [attendanceRecord?.attendancelog])

    const calendarCells = useMemo(() => buildCalendarCells(monthValue), [monthValue])

    const attendanceByDate = useMemo(() => {
        const mapped = {}
        for (let index = 0; index < attendanceLogs.length; index++) {
            const log = attendanceLogs[index]
            const dateKey = toDateKey(log.logdate)
            if (!dateKey || !dateKey.startsWith(monthValue)) continue
            mapped[dateKey] = log.logstatus || "Not Specified"
        }
        return mapped
    }, [attendanceLogs, monthValue])

    const attendanceSummary = useMemo(() => {
        return {
            present: attendanceLogs.filter((log) => log.logstatus === "Present").length,
            absent: attendanceLogs.filter((log) => log.logstatus === "Absent").length,
            notSpecified: attendanceLogs.filter((log) => log.logstatus !== "Present" && log.logstatus !== "Absent").length,
        }
    }, [attendanceLogs])

    const selectedDateStatus = attendanceByDate[selectedDate] || "Not Specified"

    const handleMonthChange = (e) => {
        const nextMonth = e.target.value
        setMonthValue(nextMonth)
        const todayKey = toDateKey(new Date())
        setSelectedDate(todayKey.startsWith(nextMonth) ? todayKey : `${nextMonth}-01`)
    }

    const initializeAttendance = async () => {
        if (!employee?._id) return
        try {
            setMessage("")
            await apiService.post("/api/v1/attendance/initialize", { employeeID: employee._id })
            setMessage("Attendance initialized.")
            fetchEmployee()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Initialize failed")
        }
    }

    const markAttendance = async () => {
        if (!attendanceID) return
        try {
            setMessage("")
            await apiService.patch("/api/v1/attendance/update-attendance", {
                attendanceID,
                status,
                currentdate: today(),
            })
            setMessage("Attendance updated.")
            fetchEmployee()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Update failed")
        }
    }

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Attendances">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {message ? <p className="font-bold text-blue-700">{message}</p> : null}
            {!attendanceID ? (
                <button onClick={initializeAttendance} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Initialize Attendance
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1">
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Not Specified">Not Specified</option>
                        </select>
                        <button onClick={markAttendance} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                            Mark Today
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="border rounded p-2 bg-green-50">
                            <p className="text-xs text-green-700">Present</p>
                            <p className="font-bold text-green-700">{attendanceSummary.present}</p>
                        </div>
                        <div className="border rounded p-2 bg-red-50">
                            <p className="text-xs text-red-700">Absent</p>
                            <p className="font-bold text-red-700">{attendanceSummary.absent}</p>
                        </div>
                        <div className="border rounded p-2 bg-slate-50">
                            <p className="text-xs text-slate-700">Not Specified</p>
                            <p className="font-bold text-slate-700">{attendanceSummary.notSpecified}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold">Month</label>
                            <input type="month" className="border rounded px-2 py-1" value={monthValue} onChange={handleMonthChange} />
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

                    <div className="grid grid-cols-7 gap-2">
                        {calendarCells.map((cell) => {
                            const dayStatus = attendanceByDate[cell.dateKey] || "Not Specified"
                            return (
                                <button
                                    type="button"
                                    key={cell.dateKey}
                                    onClick={() => setSelectedDate(cell.dateKey)}
                                    className={`min-h-24 rounded border p-2 text-left transition hover:shadow-sm ${attendanceStatusClasses(dayStatus)} ${!cell.inCurrentMonth ? "opacity-40" : ""} ${selectedDate === cell.dateKey ? "ring-2 ring-blue-600" : ""}`}
                                >
                                    <p className="text-xs font-bold mb-1">{cell.dayLabel}</p>
                                    <p className="text-[11px] font-semibold">{dayStatus}</p>
                                </button>
                            )
                        })}
                    </div>

                    <div className="border rounded p-3">
                        <p className="font-semibold">Status on {formatDate(selectedDate)}</p>
                        <p className={`mt-2 inline-flex rounded border px-2 py-1 text-sm font-semibold ${attendanceStatusClasses(selectedDateStatus)}`}>
                            {selectedDateStatus}
                        </p>
                    </div>
                </div>
            )}
            <p className="mt-3">Attendance ID: {attendanceID || "Not initialized"}</p>
        </ModuleLayout>
    )
}

export const EmployeeRequestsPage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [form, setForm] = useState({ requesttitle: "", requestconent: "" })
    const [message, setMessage] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [editForms, setEditForms] = useState({})

    const requestData = useMemo(() => employee?.generaterequest || [], [employee?.generaterequest])

    useEffect(() => {
        const mapped = {}
        for (let index = 0; index < requestData.length; index++) {
            const item = requestData[index]
            mapped[item._id] = {
                requesttitle: item.requesttitle || "",
                requestconent: item.requestconent || "",
            }
        }
        setEditForms(mapped)
    }, [requestData])

    const requestSummary = useMemo(() => ({
        total: requestData.length,
        pending: requestData.filter((item) => item.status === "Pending").length,
        approved: requestData.filter((item) => item.status === "Approved").length,
        denied: requestData.filter((item) => item.status === "Denied").length,
    }), [requestData])

    const filteredRequests = useMemo(() => {
        if (statusFilter === "All") return requestData
        return requestData.filter((item) => item.status === statusFilter)
    }, [requestData, statusFilter])

    const createRequest = async (e) => {
        e.preventDefault()
        if (!employee?._id) return
        try {
            setMessage("")
            await apiService.post("/api/v1/generate-request/create-request", { employeeID: employee._id, ...form })
            setMessage("Request submitted.")
            setForm({ requesttitle: "", requestconent: "" })
            fetchEmployee()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Request failed")
        }
    }

    const updateRequestContent = async (requestID) => {
        const formValues = editForms[requestID]
        if (!formValues?.requesttitle || !formValues?.requestconent) {
            setMessage("Request title and content are required.")
            return
        }

        try {
            setMessage("")
            await apiService.patch("/api/v1/generate-request/update-request-content", {
                requestID,
                requesttitle: formValues.requesttitle,
                requestconent: formValues.requestconent,
            })
            setMessage("Request updated and moved to pending review.")
            fetchEmployee()
        } catch (err) {
            setMessage(err?.response?.data?.message || "Request update failed")
        }
    }

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Requests">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {message ? <p className="font-bold text-blue-700">{message}</p> : null}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Requests</p>
                    <p className="font-bold">{requestSummary.total}</p>
                </div>
                <div className="border rounded p-2 bg-yellow-50">
                    <p className="text-xs text-yellow-700">Pending</p>
                    <p className="font-bold text-yellow-700">{requestSummary.pending}</p>
                </div>
                <div className="border rounded p-2 bg-green-50">
                    <p className="text-xs text-green-700">Approved</p>
                    <p className="font-bold text-green-700">{requestSummary.approved}</p>
                </div>
                <div className="border rounded p-2 bg-red-50">
                    <p className="text-xs text-red-700">Denied</p>
                    <p className="font-bold text-red-700">{requestSummary.denied}</p>
                </div>
            </div>

            <form onSubmit={createRequest} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 border-b pb-3">
                <input className="border rounded px-2 py-1" placeholder="Request title" value={form.requesttitle} onChange={(e) => setForm({ ...form, requesttitle: e.target.value })} required />
                <input className="border rounded px-2 py-1" placeholder="Request content" value={form.requestconent} onChange={(e) => setForm({ ...form, requestconent: e.target.value })} required />
                <button type="submit" className="w-fit px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Submit</button>
            </form>

            <div className="mb-3">
                <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                </select>
            </div>

            {filteredRequests.length === 0 ? <p>No requests found.</p> : null}
            {filteredRequests.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3">
                    <p className="font-bold">{item.requesttitle}</p>
                    <p>{item.requestconent}</p>
                    <p className="text-sm">Status: {item.status}</p>
                    <p className="text-sm">Date: {formatDate(item.createdAt)}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.requesttitle || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], requesttitle: e.target.value },
                            }))}
                            placeholder="Update title"
                        />
                        <input
                            className="border rounded px-2 py-1"
                            value={editForms[item._id]?.requestconent || ""}
                            onChange={(e) => setEditForms((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], requestconent: e.target.value },
                            }))}
                            placeholder="Update content"
                        />
                        <button
                            type="button"
                            className="w-fit px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                            onClick={() => updateRequestContent(item._id)}
                        >
                            Update Request
                        </button>
                    </div>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeRecruitmentPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("All")

    const fetchRecruitments = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await apiService.get("/api/v1/recruitment/employee/all")
            setData(response.data?.data || [])
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load recruitment openings")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecruitments()
    }, [])

    const recruitmentSummary = useMemo(() => {
        const departments = new Set()
        for (let index = 0; index < data.length; index++) {
            const departmentName = data[index]?.department?.name
            if (departmentName) departments.add(departmentName)
        }

        return {
            openings: data.length,
            departments: departments.size,
        }
    }, [data])

    const departmentOptions = useMemo(() => {
        const names = new Set()
        for (let index = 0; index < data.length; index++) {
            const departmentName = data[index]?.department?.name
            if (departmentName) names.add(departmentName)
        }
        return Array.from(names).sort((a, b) => a.localeCompare(b))
    }, [data])

    const filteredOpenings = useMemo(() => {
        return data.filter((item) => {
            const matchesDepartment = departmentFilter === "All" || (item?.department?.name || "-") === departmentFilter
            const searchText = `${item.jobtitle || ""} ${item.description || ""} ${item?.department?.name || ""}`.toLowerCase()
            const matchesSearch = searchText.includes(search.toLowerCase().trim())
            return matchesDepartment && matchesSearch
        })
    }, [data, departmentFilter, search])

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Recruitment">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Open Positions</p>
                    <p className="font-bold">{recruitmentSummary.openings}</p>
                </div>
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Departments Hiring</p>
                    <p className="font-bold">{recruitmentSummary.departments}</p>
                </div>
                <button type="button" className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={fetchRecruitments}>
                    Refresh Openings
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                <input
                    className="border rounded px-2 py-1 min-w-52"
                    placeholder="Search by title, description, department"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="border rounded px-2 py-1"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {departmentOptions.map((departmentName) => (
                        <option key={departmentName} value={departmentName}>{departmentName}</option>
                    ))}
                </select>
            </div>

            {filteredOpenings.length === 0 ? <p>No openings found.</p> : null}
            {filteredOpenings.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3">
                    <p className="font-bold text-lg">{item.jobtitle}</p>
                    <p className="text-sm text-gray-700">Department: {item?.department?.name || "-"}</p>
                    <p className="text-sm text-gray-700">Created: {formatDate(item.createdAt)}</p>
                    <p className="mt-2">{item.description}</p>
                    <p className="text-xs text-gray-600 mt-2">Assigned Applicants: {(item.application || []).length}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeInterviewInsightsPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const fetchInsights = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await apiService.get("/api/v1/interview-insights/employee/all")
            setData(response.data?.data || [])
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load interview insights")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInsights()
    }, [])

    const insightSummary = useMemo(() => ({
        total: data.length,
        pending: data.filter((item) => item.status === "Pending").length,
        completed: data.filter((item) => item.status === "Completed").length,
        canceled: data.filter((item) => item.status === "Canceled").length,
    }), [data])

    const filteredInsights = useMemo(() => {
        if (statusFilter === "All") return data
        return data.filter((item) => item.status === statusFilter)
    }, [data, statusFilter])

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Interview Insights">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
                <div className="border rounded p-2">
                    <p className="text-xs text-gray-600">Total Interviews</p>
                    <p className="font-bold">{insightSummary.total}</p>
                </div>
                <div className="border rounded p-2 bg-yellow-50">
                    <p className="text-xs text-yellow-700">Pending</p>
                    <p className="font-bold text-yellow-700">{insightSummary.pending}</p>
                </div>
                <div className="border rounded p-2 bg-green-50">
                    <p className="text-xs text-green-700">Completed</p>
                    <p className="font-bold text-green-700">{insightSummary.completed}</p>
                </div>
                <div className="border rounded p-2 bg-red-50">
                    <p className="text-xs text-red-700">Canceled</p>
                    <p className="font-bold text-red-700">{insightSummary.canceled}</p>
                </div>
                <button type="button" className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={fetchInsights}>
                    Refresh
                </button>
            </div>

            <div className="mb-3">
                <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>

            {filteredInsights.length === 0 ? <p>No interview insights found.</p> : null}
            {filteredInsights.map((item) => (
                <div key={item._id} className="border rounded p-3 mb-3">
                    <p className="font-bold">Applied Role: {item?.applicant?.appliedrole || "-"}</p>
                    <p>Applicant: {item?.applicant ? `${item.applicant.firstname || ""} ${item.applicant.lastname || ""}`.trim() : "-"}</p>
                    <p>Interviewer: {item?.interviewer ? `${item.interviewer.firstname || ""} ${item.interviewer.lastname || ""}`.trim() : "-"}</p>
                    <p>Status: {item.status}</p>
                    <p>Interview Date: {formatDate(item.interviewdate)}</p>
                    <p>Response Date: {formatDate(item.responsedate)}</p>
                    <p>Recruitment Progress: {item?.applicant?.recruitmentstatus || "-"}</p>
                    <p>Feedback: {item.feedback || "Feedback not shared yet."}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}
