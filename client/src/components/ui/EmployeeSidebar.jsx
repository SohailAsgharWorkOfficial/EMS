import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"
import { apiService } from "../../redux/apis/APIService"

export function EmployeeSidebar() {
    const logoutEmployee = async () => {
        try {
            await apiService.post("/api/auth/employee/logout")
        } catch {
            // Redirect regardless.
        } finally {
            window.location.href = "/auth/employee/login"
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3 p-2">
                            <NavLink to={"/auth/employee/employee-dashboard/dashboard-data"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Dashboard</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/salaries"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Salaries</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/notices"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/notice.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Issue Notices</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/leaves"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Leaves</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/attendances"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Attendances</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/recruitment"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/recruitment.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Recruitment</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/interview-insights"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/interview-insights.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Interview Insights</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/employee-dashboard/requests"} className={({ isActive }) => (isActive ? "bg-blue-200 rounded-lg" : "")}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Requests</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <SidebarMenuItem className="my-1">
                                <SidebarMenuButton className="gap-4 bg-red-700 text-white hover:bg-red-800 hover:text-white" onClick={logoutEmployee}>
                                    <button className="text-[16px] font-bold">Logout</button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
