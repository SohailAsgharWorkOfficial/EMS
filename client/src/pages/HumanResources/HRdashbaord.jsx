import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HRdashboardSidebar } from "../../components/ui/HRsidebar.jsx"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

export const HRDashbaord = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (location.pathname === "/HR/dashboard") {
            navigate("/HR/dashboard/dashboard-data", { replace: true })
        }
    }, [location.pathname, navigate])

    return (
        <div className="HR-dashboard-container flex">
            <div className="HRDashboard-sidebar">
                <SidebarProvider>
                    <HRdashboardSidebar />
                    <div className="sidebar-container min-[250px]:absolute md:relative">
                        <SidebarTrigger />
                    </div>
                </SidebarProvider>
            </div>
            <div className="HRdashboard-container h-screen w-full min-[250px]:mx-1 md:mx-2 flex flex-col">
                <Outlet />
            </div>
        </div>
    )
}
