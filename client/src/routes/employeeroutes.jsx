import { EmployeeLogin } from "../pages/Employees/emplyoeelogin.jsx"
import { EmployeeDashboardLayout } from "../pages/Employees/employeedashboardlayout.jsx"
import { ProtectedRoutes } from "./protectedroutes.jsx"
import { ForgotPassword } from "../pages/Employees/forgotpassword.jsx"
import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
import { ResetPassword } from "../pages/Employees/resetpassword.jsx"
import { EntryPage } from "../pages/Employees/EntryPage.jsx"
import { EmployeeDashboardHome, EmployeeSalariesPage, EmployeeNoticesPage, EmployeeLeavesPage, EmployeeAttendancePage, EmployeeRecruitmentPage, EmployeeInterviewInsightsPage, EmployeeRequestsPage } from "../pages/Employees/dashboardmodules.jsx"
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
        element: <ProtectedRoutes><EmployeeDashboardLayout /></ProtectedRoutes>,
        children: [
            {
                path: "/auth/employee/employee-dashboard/dashboard-data",
                element: <EmployeeDashboardHome />
            },
            {
                path: "/auth/employee/employee-dashboard/salaries",
                element: <EmployeeSalariesPage />
            },
            {
                path: "/auth/employee/employee-dashboard/notices",
                element: <EmployeeNoticesPage />
            },
            {
                path: "/auth/employee/employee-dashboard/leaves",
                element: <EmployeeLeavesPage />
            },
            {
                path: "/auth/employee/employee-dashboard/attendances",
                element: <EmployeeAttendancePage />
            },
            {
                path: "/auth/employee/employee-dashboard/recruitment",
                element: <EmployeeRecruitmentPage />
            },
            {
                path: "/auth/employee/employee-dashboard/interview-insights",
                element: <EmployeeInterviewInsightsPage />
            },
            {
                path: "/auth/employee/employee-dashboard/requests",
                element: <EmployeeRequestsPage />
            }
        ]
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

