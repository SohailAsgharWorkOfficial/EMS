import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"
import { HRdashboardSidebar } from "../../components/ui/HRsidebar.jsx"
import { Outlet } from "react-router-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

export const HRDashbaord = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pathArray = location.pathname.split("/")


    useEffect(() => {
        navigate(`/HR/dashboard/${pathArray[pathArray.length - 1]}`)
    }, [])


    console.log("this is the current path location", location)


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