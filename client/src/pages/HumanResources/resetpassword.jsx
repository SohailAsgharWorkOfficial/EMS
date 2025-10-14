import { Reset_Password } from "../../components/common/reset-password.jsx"
import { useState, useEffect, useRef } from "react"
// import { SignIn } from "../../components/common/sign-in.jsx"
import { useDispatch, useSelector } from "react-redux"
// import { HandlePostEmployees, HandleGetEmployees } from "../../redux/Thunks/EmployeeThunk.js"
import { HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate, useParams } from 'react-router-dom'


export const ResetHRPasswordPage = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const { token } = useParams()
    const [passworderror, setpassworderror] = useState(false)
    const [passwordform, setpasswordform] = useState({
        password: "",
        repeatpassword: ""
    })


    const handlepasswordsubmit = (e) => {
        if (passwordform.password === passwordform.repeatpassword) { 
            e.preventDefault();
            loadingbar.current.continuousStart();
            setpassworderror(false)
            dispatch(HandlePostHumanResources({ apiroute: token, data: { password: passwordform.password }, type: "resetpassword" }))
        }
        else {
            e.preventDefault();
            setpassworderror(true)
        }
    }

    const handlepasswordform = (e) => {
        setpasswordform({ ...passwordform, [e.target.name]: e.target.value })
    }

    if (HRState.error.status) {
        loadingbar.current.complete()
    }

    useEffect(() => {
        if (HRState.isResetPassword) {
            loadingbar.current.complete()
            navigate("/auth/HR/login")
        }
    }, [HRState.isResetPassword])

    console.log(HRState)

    return (
        <div className="reset-password-container">
            <LoadingBar ref={loadingbar} />
            <div className="reset-password-content flex justify-center items-center h-[100vh]">
                <Reset_Password handlepasswordsubmit={handlepasswordsubmit} handlepasswordform={handlepasswordform} passworderror={passworderror} targetstate={HRState} />
            </div>
        </div>
    )
}