import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavLink } from "react-router-dom"
import { apiService } from "../../redux/apis/APIService"

export function HRdashboardSidebar() {
    const logoutHR = async () => {
        try {
            await apiService.post("/api/auth/HR/logout")
        } catch (error) {
            // Navigate to login even if API fails; local auth state will reset on reload.
        } finally {
            window.location.href = "/auth/HR/login"
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>HR-Dashboard EMS</SidebarGroupLabel> */}
                    <SidebarGroupContent>

                        <SidebarMenu className="gap-3 p-2">


                            <NavLink to={"/HR/dashboard/dashboard-data"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Dashboard</button>
                                </SidebarMenuItem>

                            </NavLink>


                            <NavLink to={"/HR/dashboard/employees"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Employees</button>
                                </SidebarMenuItem>

                            </NavLink>



                            <NavLink to={"/HR/dashboard/departments"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">

                                    <img src="/../../src/assets/HR-Dashboard/department.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Departments</button>

                                </SidebarMenuItem>

                            </NavLink>

                            <NavLink to={"/HR/dashboard/salaries"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Salaries</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/notices"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/notice.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Issue Notices</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/leaves"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Leaves</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/attendances"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Attendances</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/recruitment"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/recruitment.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Recruitment</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/applicants"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Applicants</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/interview-insights"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/interview-insights.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Interview Insights</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/requests"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7" />
                                        <button className="text-[16px]">Requests</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/hr-profiles"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="my-1 hover:bg-blue-200 rounded-lg">
                                    <SidebarMenuButton className="gap-4">
                                        <img src="/../../src/assets/HR-Dashboard/HR-profiles.png" alt="" className="w-7" />
                                        <button className="text-[16px]">HR Profiles</button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </NavLink>

                            <SidebarMenuItem className="my-1">
                                <SidebarMenuButton className="gap-4 bg-red-700 text-white hover:bg-red-800 hover:text-white" onClick={logoutHR}>
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
