import { useEffect, useMemo, useState } from "react"
import { apiService } from "../../redux/apis/APIService"
import { Loading } from "../../components/common/loading.jsx"

const today = () => new Date().toISOString().split("T")[0]

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

const RoleInfo = ({ title }) => (
    <ModuleLayout title={title}>
        <p className="text-gray-700 font-semibold">This module is managed by HR. Employee account has no direct access here.</p>
    </ModuleLayout>
)

const formatDate = (value) => {
    if (!value) return "-"
    try {
        return new Date(value).toLocaleDateString()
    } catch {
        return "-"
    }
}

export const EmployeeDashboardHome = () => {
    const { employee, loading, error } = useEmployeeData()

    const counts = useMemo(() => ({
        notices: employee?.notice?.length || 0,
        salaries: employee?.salary?.length || 0,
        leaves: employee?.leaverequest?.length || 0,
        requests: employee?.generaterequest?.length || 0,
    }), [employee])

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
                <CountCard label="Requests" value={counts.requests} />
            </div>
        </ModuleLayout>
    )
}

export const EmployeeSalariesPage = () => {
    const { employee, loading, error } = useEmployeeData()
    if (loading) return <Loading />
    return (
        <ModuleLayout title="Salaries">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {(employee?.salary || []).length === 0 ? <p>No salary records found.</p> : null}
            {(employee?.salary || []).map((item) => (
                <div key={item._id} className="border-b py-2">
                    <p className="font-bold">Net Pay: {item.netpay} {item.currency}</p>
                    <p>Basic: {item.basicpay} | Bonus: {item.bonuses} | Deduction: {item.deductions}</p>
                    <p>Due Date: {formatDate(item.duedate)}</p>
                    <p>Payment Date: {formatDate(item.paymentdate)}</p>
                    <p>Status: {item.status}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeNoticesPage = () => {
    const { employee, loading, error } = useEmployeeData()
    if (loading) return <Loading />
    return (
        <ModuleLayout title="Issue Notices">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {(employee?.notice || []).length === 0 ? <p>No notices found.</p> : null}
            {(employee?.notice || []).map((item) => (
                <div key={item._id} className="border-b py-2">
                    <p className="font-bold">{item.title}</p>
                    <p>{item.content}</p>
                    <p>Audience: {item.audience}</p>
                    <p>Date: {formatDate(item.createdAt)}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeLeavesPage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [form, setForm] = useState({ title: "", reason: "", startdate: "", enddate: "" })
    const [message, setMessage] = useState("")

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
            {(employee?.leaverequest || []).length === 0 ? <p>No leave records found.</p> : null}
            {(employee?.leaverequest || []).map((item) => (
                <div key={item._id} className="border-b py-2">
                    <p className="font-bold">{item.title}</p>
                    <p>{item.reason}</p>
                    <p>{formatDate(item.startdate)} - {formatDate(item.enddate)}</p>
                    <p>Status: {item.status}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeAttendancePage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [status, setStatus] = useState("Present")
    const [message, setMessage] = useState("")

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
        if (!employee?.attendance) return
        try {
            setMessage("")
            await apiService.patch("/api/v1/attendance/update-attendance", {
                attendanceID: employee.attendance,
                status,
                currentdate: today(),
            })
            setMessage("Attendance updated.")
        } catch (err) {
            setMessage(err?.response?.data?.message || "Update failed")
        }
    }

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Attendances">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {message ? <p className="font-bold text-blue-700">{message}</p> : null}
            {!employee?.attendance ? (
                <button onClick={initializeAttendance} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Initialize Attendance
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="WFH">WFH</option>
                        <option value="Leave">Leave</option>
                    </select>
                    <button onClick={markAttendance} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                        Mark Today
                    </button>
                </div>
            )}
            <p className="mt-3">Attendance ID: {employee?.attendance || "Not initialized"}</p>
        </ModuleLayout>
    )
}

export const EmployeeRequestsPage = () => {
    const { employee, loading, error, fetchEmployee } = useEmployeeData()
    const [form, setForm] = useState({ requesttitle: "", requestconent: "" })
    const [message, setMessage] = useState("")

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

    if (loading) return <Loading />

    return (
        <ModuleLayout title="Requests">
            {error ? <p className="text-red-700 font-bold">{error}</p> : null}
            {message ? <p className="font-bold text-blue-700">{message}</p> : null}
            <form onSubmit={createRequest} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <input className="border rounded px-2 py-1" placeholder="Request title" value={form.requesttitle} onChange={(e) => setForm({ ...form, requesttitle: e.target.value })} required />
                <input className="border rounded px-2 py-1" placeholder="Request content" value={form.requestconent} onChange={(e) => setForm({ ...form, requestconent: e.target.value })} required />
                <button type="submit" className="w-fit px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Submit</button>
            </form>
            {(employee?.generaterequest || []).length === 0 ? <p>No requests found.</p> : null}
            {(employee?.generaterequest || []).map((item) => (
                <div key={item._id} className="border-b py-2">
                    <p className="font-bold">{item.requesttitle}</p>
                    <p>{item.requestconent}</p>
                    <p>Status: {item.status}</p>
                    <p>Date: {formatDate(item.createdAt)}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const EmployeeRecruitmentPage = () => <RoleInfo title="Recruitment" />
export const EmployeeInterviewInsightsPage = () => <RoleInfo title="Interview Insights" />
