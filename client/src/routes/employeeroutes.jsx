import { EmployeeLogin } from "../pages/Employees/emplyoeelogin.jsx"
import { EmployeeDashboard } from "../pages/Employees/employeedashboard.jsx"
import { ProtectedRoutes } from "./protectedroutes.jsx"
import { ForgotPassword } from "../pages/Employees/forgotpassword.jsx"
import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
import { ResetPassword } from "../pages/Employees/resetpassword.jsx"
import { EntryPage } from "../pages/Employees/EntryPage.jsx"
// import { VerifyEmailPage } from "../pages/common/verifyemailpage.jsx"

export const EmployeeRoutes = [
    {
        path: "/",
        element: <EntryPage />
    },
    {
        path: "/auth/employee/login",
        element: <EmployeeLogin />
    },
    // {
    //     path: "/auth/employee/verify-email", 
    //     element: <VerifyEmailPage />
    // },
    {
        path: "/auth/employee/employee-dashboard",
        element: <ProtectedRoutes> <EmployeeDashboard /> </ProtectedRoutes>
    },
    {
        path: "/auth/employee/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/auth/employee/reset-email-confirmation",
        element: <ResetEmailConfirm />
    },
    {
        path: "/auth/employee/resetpassword/:token",
        element: <ResetPassword /> 
    },
]

