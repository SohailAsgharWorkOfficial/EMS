import { ResetVerifyEmailPage } from "../common/verify-email"
import { SignIn } from "../../components/common/sign-in.jsx"
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import LoadingBar from 'react-top-loading-bar'
import { CommonStateHandler } from "../../utils/commonhandler.js"
import { HandleGetHumanResources, HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"
export const ResetHRVerifyEmailPage = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const [emailvalue, setemailvalue] = useState({
        email: ""
    })

    const handleverifybutton = () => {
        loadingbar.current.continuousStart();
        dispatch(HandlePostHumanResources({ apiroute: "RESEND_VERIFY_EMAIL", data: emailvalue })) 
    }

    const handleverifyemail = (event) => {
        CommonStateHandler(emailvalue, setemailvalue, event)
    }

    if (HRState.error.status) {
        loadingbar.current.complete()
    }

    useEffect(() => {
        if (HRState.isVerified) {
            loadingbar.current.complete()
            navigate("/auth/HR/dashboard")
        }

        if (HRState.isVerifiedEmailAvailable) {
            loadingbar.current.complete()
            navigate("/auth/HR/verify-email")
        }
    }, [HRState.isVerified, HRState.isVerifiedEmailAvailable])

    console.log(HRState)

    return (
        <>
            <LoadingBar ref={loadingbar} />
            <ResetVerifyEmailPage handleverifybutton={handleverifybutton} handleverifyemail={handleverifyemail} emailvalue={emailvalue.email} targetstate={HRState}/>
        </>
    )
}