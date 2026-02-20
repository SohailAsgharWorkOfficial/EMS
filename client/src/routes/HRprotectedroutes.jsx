import { HandleGetHumanResources } from "../redux/Thunks/HRThunk.js"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Loading } from "../components/common/loading.jsx"

export const HRProtectedRoutes = ({ children }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const HRState = useSelector((state) => state.HRReducer)

    useEffect(() => {
        if (!HRState.isAuthenticated || !HRState.isAuthourized) {
            dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
            return
        }

        if (HRState.isAuthenticated && HRState.isAuthourized && !HRState.isVerified) {
            dispatch(HandleGetHumanResources({ apiroute: "CHECK_VERIFY_EMAIL" }))
        }
    }, [dispatch, HRState.isAuthenticated, HRState.isAuthourized, HRState.isVerified])

    useEffect(() => {
        if (HRState.isAuthenticated && HRState.isAuthourized && !HRState.isVerified && HRState.error.content?.type === "HRcodeavailable") {
            navigate("/auth/HR/reset-email-validation", { replace: true })
            return
        }

        if (!HRState.isAuthenticated && HRState.error.content?.gologin) {
            navigate("/auth/HR/login", { replace: true })
        }
    }, [navigate, HRState.isAuthenticated, HRState.isAuthourized, HRState.isVerified, HRState.error.content])

    const isAllowed = HRState.isAuthenticated && HRState.isAuthourized && HRState.isVerified
    const needsVerificationCheck = HRState.isAuthenticated && HRState.isAuthourized && !HRState.isVerified && !HRState.error.content

    if (HRState.isLoading || needsVerificationCheck) {
        return (
            <Loading />
        )
    }

    if (isAllowed) return children

    return <Navigate to="/auth/HR/login" replace />
}
