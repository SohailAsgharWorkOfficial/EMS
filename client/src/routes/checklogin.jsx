import { Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { HandleGetEmployees } from "../redux/Thunks/EmployeeThunk"
export const CheckLogin = ({ children }) => {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.employeereducer)

    if (!isAuthenticated) {
        dispatch(HandleGetEmployees({ apiroute: "CHECKELOGIN" }))
    }
    return (
        isAuthenticated ? <Navigate to={"/employee-dashboard"} /> : children
    )
}