import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiService } from "../../redux/apis/APIService"

const formatDate = (value) => {
    if (!value) return "-"
    try {
        return new Date(value).toLocaleDateString()
    } catch {
        return "-"
    }
}

export const CareersApplyPage = () => {
    const [searchParams] = useSearchParams()
    const [openings, setOpenings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [selectedRecruitmentID, setSelectedRecruitmentID] = useState("")
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
    })

    const organizationURL = searchParams.get("organizationURL") || ""

    const fetchOpenings = async () => {
        try {
            setLoading(true)
            setError("")

            const query = new URLSearchParams()
            if (organizationURL) {
                query.set("organizationURL", organizationURL)
            }

            const endpoint = query.toString()
                ? `/api/v1/applicant/public/openings?${query.toString()}`
                : "/api/v1/applicant/public/openings"

            const response = await apiService.get(endpoint)
            const openingData = response.data?.data || []
            setOpenings(openingData)

            if (!selectedRecruitmentID && openingData.length > 0) {
                setSelectedRecruitmentID(openingData[0]._id)
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to load openings")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOpenings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationURL])

    const selectedOpening = useMemo(() => {
        return openings.find((item) => item._id === selectedRecruitmentID) || null
    }, [openings, selectedRecruitmentID])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedRecruitmentID) {
            setMessage("Please select an opening before applying.")
            return
        }

        try {
            setMessage("")
            await apiService.post("/api/v1/applicant/public/apply", {
                recruitmentID: selectedRecruitmentID,
                ...form,
            })
            setMessage("Application submitted successfully. HR will contact you soon.")
            setForm({
                firstname: "",
                lastname: "",
                email: "",
                contactnumber: "",
            })
        } catch (err) {
            setMessage(err?.response?.data?.message || "Application submission failed")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Careers - Apply Now</h1>
                    <Link to="/" className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                        Back To Home
                    </Link>
                </div>

                {organizationURL ? (
                    <p className="mb-4 text-sm text-slate-600">Filtering openings for organization URL: {organizationURL}</p>
                ) : null}

                {error ? <p className="mb-4 font-bold text-red-700">{error}</p> : null}
                {message ? <p className="mb-4 font-bold text-blue-700">{message}</p> : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded border bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Openings</h2>
                            <button
                                type="button"
                                className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-300"
                                onClick={fetchOpenings}
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? <p>Loading openings...</p> : null}
                        {!loading && openings.length === 0 ? <p>No openings available right now.</p> : null}

                        <div className="flex flex-col gap-2">
                            {openings.map((opening) => (
                                <button
                                    key={opening._id}
                                    type="button"
                                    onClick={() => setSelectedRecruitmentID(opening._id)}
                                    className={`rounded border p-3 text-left ${selectedRecruitmentID === opening._id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}
                                >
                                    <p className="font-bold">{opening.jobtitle}</p>
                                    <p className="text-sm text-slate-700">{opening.description}</p>
                                    <p className="text-xs text-slate-600">Department: {opening?.department?.name || "-"}</p>
                                    <p className="text-xs text-slate-600">Organization: {opening?.organizationID?.name || "-"}</p>
                                    <p className="text-xs text-slate-600">Posted: {formatDate(opening.createdAt)}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded border bg-white p-4">
                        <h2 className="mb-3 text-xl font-bold">Application Form</h2>
                        <p className="mb-3 text-sm text-slate-700">
                            Selected Role: <span className="font-semibold">{selectedOpening?.jobtitle || "Please select an opening"}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
                            <input
                                className="rounded border px-3 py-2"
                                placeholder="First Name"
                                value={form.firstname}
                                onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                                required
                            />
                            <input
                                className="rounded border px-3 py-2"
                                placeholder="Last Name"
                                value={form.lastname}
                                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                className="rounded border px-3 py-2"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <input
                                className="rounded border px-3 py-2"
                                placeholder="Contact Number"
                                value={form.contactnumber}
                                onChange={(e) => setForm({ ...form, contactnumber: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                className="mt-2 rounded bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800"
                                disabled={loading || !selectedRecruitmentID}
                            >
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

