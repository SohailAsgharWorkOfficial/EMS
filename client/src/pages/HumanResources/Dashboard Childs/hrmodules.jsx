import { useEffect, useState } from "react"
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
        } catch (err) {
            // Employees list is optional for rendering existing salary rows.
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const deleteSalary = async (salaryID) => {
        try {
            await apiService.delete(`/api/v1/salary/delete-salary/${salaryID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    const createSalary = async (e) => {
        e.preventDefault()
        try {
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
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Create salary failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Salaries">
            {error ? <ErrorText message={error} /> : null}
            <form onSubmit={createSalary} className="grid grid-cols-1 md:grid-cols-6 gap-2 border-b pb-3 mb-3">
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
                    className="border rounded px-2 py-1"
                    placeholder="Basic Pay"
                    value={salaryForm.basicpay}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicpay: e.target.value })}
                    required
                />
                <input
                    type="number"
                    className="border rounded px-2 py-1"
                    placeholder="Bonus %"
                    value={salaryForm.bonusePT}
                    onChange={(e) => setSalaryForm({ ...salaryForm, bonusePT: e.target.value })}
                    required
                />
                <input
                    type="number"
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
                    required
                />
                <button type="submit" className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Add Salary
                </button>
            </form>
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.employee ? `${item.employee.firstname} ${item.employee.lastname}` : "Employee"}</p>
                        <p>Net Pay: {item.netpay} {item.currency}</p>
                        <p>Status: {item.status}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteSalary(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRNoticesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/notice/all")
    const departmentNotices = data?.department_notices || []
    const employeeNotices = data?.employee_notices || []

    const deleteNotice = async (noticeID) => {
        try {
            await apiService.delete(`/api/v1/notice/delete-notice/${noticeID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Issue Notices">
            {error ? <ErrorText message={error} /> : null}
            <h2 className="text-xl font-bold mt-2">Department Notices</h2>
            {departmentNotices.map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.title}</p>
                        <p>{item.content}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteNotice(item._id)} />
                </div>
            ))}
            <h2 className="text-xl font-bold mt-4">Employee Notices</h2>
            {employeeNotices.map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.title}</p>
                        <p>{item.content}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteNotice(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRLeavesPage = () => {
    const { data, loading, error } = useModuleData("/api/v1/leave/all")
    if (loading) return <Loading />
    return (
        <ModuleLayout title="Leaves">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2">
                    <p className="font-bold">{item.employee ? `${item.employee.firstname} ${item.employee.lastname}` : "Employee"}</p>
                    <p>{item.title}</p>
                    <p>Status: {item.status}</p>
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRAttendancesPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/attendance/all")

    const deleteAttendance = async (attendanceID) => {
        try {
            await apiService.delete(`/api/v1/attendance/delete-attendance/${attendanceID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Attendances">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
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

    const deleteRecruitment = async (recruitmentID) => {
        try {
            await apiService.delete(`/api/v1/recruitment/delete-recruitment/${recruitmentID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Recruitment">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.jobtitle}</p>
                        <p>{item.description}</p>
                        <p>Applications: {(item.application || []).length}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteRecruitment(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRInterviewInsightsPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/interview-insights/all")

    const deleteInterview = async (interviewID) => {
        try {
            await apiService.delete(`/api/v1/interview-insights/delete-interview/${interviewID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Interview Insights">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p>Applicant: {item.applicant ? `${item.applicant.firstname} ${item.applicant.lastname}` : "-"}</p>
                        <p>Interviewer: {item.interviewer ? `${item.interviewer.firstname} ${item.interviewer.lastname}` : "-"}</p>
                        <p>Status: {item.status}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteInterview(item._id)} />
                </div>
            ))}
        </ModuleLayout>
    )
}

export const HRRequestsPage = () => {
    const { data, loading, error, fetchData } = useModuleData("/api/v1/generate-request/all")

    const deleteRequest = async (requestID) => {
        try {
            await apiService.delete(`/api/v1/generate-request/delete-request/${requestID}`, { withCredentials: true })
            fetchData()
        } catch (err) {
            alert(err?.response?.data?.message || "Delete failed")
        }
    }

    if (loading) return <Loading />
    return (
        <ModuleLayout title="Requests">
            {error ? <ErrorText message={error} /> : null}
            {(data || []).map((item) => (
                <div key={item._id} className="border-b py-2 flex justify-between gap-3">
                    <div>
                        <p className="font-bold">{item.requesttitle}</p>
                        <p>{item.requestconent}</p>
                        <p>Status: {item.status}</p>
                    </div>
                    <ActionButton label="Delete" onClick={() => deleteRequest(item._id)} />
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
