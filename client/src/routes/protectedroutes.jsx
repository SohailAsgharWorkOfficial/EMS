import { Navigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import { HandleGetEmployees } from "../redux/Thunks/EmployeeThunk"
export const ProtectedRoutes = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.employeereducer)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(HandleGetEmployees({ apiroute: "CHECKELOGIN" }))
    }, [isAuthenticated])
    
    return (
        isAuthenticated ? children : <Navigate to="/" />
    )
}