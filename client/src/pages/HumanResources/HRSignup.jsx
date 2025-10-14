import { SignUP } from "../../components/common/sign-up"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
// import { HandlePostEmployees, HandleGetEmployees } from "../../redux/Thunks/EmployeeThunk.js"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { CommonStateHandler } from "../../utils/commonhandler.js"
import { HandlePostHumanResources, HandleGetHumanResources } from "../../redux/Thunks/HRThunk.js"

export const HRSignupPage = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const [errorpopup, seterrorpopup] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const [signupform, set_signuform] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        password: "",
        textpassword: "",
        name : "", 
        description : "", 
        OrganizationURL : "", 
        OrganizationMail : ""
    })

    const handlesignupform = (event) => {
        CommonStateHandler(signupform, set_signuform, event)
    }

    const handlesubmitform = (event) => {
        if (signupform.textpassword === signupform.password) {
            event.preventDefault();
            seterrorpopup(false)
            loadingbar.current.continuousStart();
            dispatch(HandlePostHumanResources({ apiroute: "SIGNUP", data: signupform }))
        }
        else {
            event.preventDefault();
            seterrorpopup(true)
        }
    }


    if (HRState.error.status) {
        loadingbar.current.complete()
    }

    useEffect(() => {
        if (!HRState.isAuthenticated && !HRState.isVerified) {
            dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
            dispatch(HandleGetHumanResources({ apiroute: "CHECK_VERIFY_EMAIL" }))
        }

        if (HRState.isAuthenticated && HRState.isVerified) {
            loadingbar.current.complete()
            navigate("/HR/dashboard/dashboard-data")
        }

        if (HRState.isAuthenticated && !HRState.isVerified) {
            loadingbar.current.complete()
            navigate("/auth/HR/verify-email")
        }
    }, [HRState.isAuthenticated, HRState.isVerified])

    // console.log(signupform)
    // console.log(HRState)

    return (
        <div className="HRsignup-page-container h-screen flex justify-center min-[900px]:justify-center min-[900px]:items-center">
            <LoadingBar ref={loadingbar} />
            <SignUP stateformdata={signupform} handlesignupform={handlesignupform} handlesubmitform={handlesubmitform} errorpopup={errorpopup} />
        </div>
    )
}