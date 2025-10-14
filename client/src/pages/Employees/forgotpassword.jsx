import { useState, useEffect, useRef } from "react"
import { SignIn } from "../../components/common/sign-in.jsx"
import { useDispatch, useSelector } from "react-redux"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { ForgotPassowrd } from "../../components/common/forgot-password.jsx"
import { HandlePostEmployees } from "../../redux/Thunks/EmployeeThunk.js"
export const ForgotPassword = () => {

    const EmplyoeeState = useSelector((state) => state.employeereducer)
    const loadingbar = useRef(null)
    const [forgotpassowrdform, setforgotpassowrdform] = useState({ email: "" })
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handlesforgotpasswordform = (e) => {
        setforgotpassowrdform({ ...forgotpassowrdform, [e.target.name]: e.target.value })
    }

    const handleforgotpasswordsubmit = (e) => {
        e.preventDefault();
        loadingbar.current.continuousStart();
        dispatch(HandlePostEmployees({ apiroute: "FORGOT_PASSWORD", data: forgotpassowrdform }))
    }

    if ((!EmplyoeeState.isLoading) && (EmplyoeeState.error.status)) { 
        loadingbar.current.complete()
    }

    useEffect(() => {
        if (EmplyoeeState.data) {
            loadingbar.current.complete()
            navigate("/auth/employee/reset-email-confirmation")
        }
    }, [EmplyoeeState.data])

    return (
        <div className="employee-login-container">
            <LoadingBar ref={loadingbar} />
            <div className="employee-login-content flex justify-center items-center h-[100vh]">
                <ForgotPassowrd handleforgotpasswordsubmit={handleforgotpasswordsubmit} handlesforgotpasswordform={handlesforgotpasswordform} targetState={EmplyoeeState} redirectpath={"/auth/employee/login"}/>
            </div>
        </div>
    )
}