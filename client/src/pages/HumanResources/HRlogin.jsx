import { SignIn } from "../../components/common/sign-in.jsx"
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import LoadingBar from 'react-top-loading-bar'
import { CommonStateHandler } from "../../utils/commonhandler.js"
import { HandleGetHumanResources, HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"

export const HRLogin = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const [signinform, setsigninform] = useState({
        email: "",
        password: ""
    })

    const handlesigninform = (event) => {
        CommonStateHandler(signinform, setsigninform, event)
    }

    const handlesigninsubmit = (e) => {
        e.preventDefault();
        loadingbar.current?.continuousStart();
        dispatch(HandlePostHumanResources({ apiroute: "LOGIN", data: signinform }))

    }

    useEffect(() => {
        if (HRState.error.status) {
            loadingbar.current?.complete()
        }
    }, [HRState.error.status])

    useEffect(() => {
        if (!HRState.isAuthenticated) return

        if (HRState.isVerified) {
            loadingbar.current?.complete()
            navigate("/HR/dashboard/dashboard-data", { replace: true })
            return
        }

        if (HRState.data?.type === "HRcodeavailable") {
            loadingbar.current?.complete()
            if (HRState.data?.alreadyverified) {
                navigate("/HR/dashboard/dashboard-data", { replace: true })
            } else {
                navigate("/auth/HR/reset-email-validation", { replace: true })
            }
            return
        }

        if (!HRState.isLoading) {
            dispatch(HandleGetHumanResources({ apiroute: "CHECK_VERIFY_EMAIL" }))
        }
    }, [
        dispatch,
        navigate,
        HRState.isAuthenticated,
        HRState.isVerified,
        HRState.isLoading,
        HRState.data?.type,
        HRState.data?.alreadyverified,
    ])


    return (
        <div>
            <div className="employee-login-content flex justify-center items-center h-[100vh]">
                <LoadingBar ref={loadingbar} />
                <SignIn image={"../../src/assets/Employee-Welcome.jpg"} handlesigninform={handlesigninform} handlesigninsubmit={handlesigninsubmit} targetedstate={HRState} statevalue={signinform} redirectpath={"/auth/HR/forgot-password"} />
            </div>
        </div>
    )
}
