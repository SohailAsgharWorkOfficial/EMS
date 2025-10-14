import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export const EntryPage = () => {
    return (
        <div className="extry-page-container h-[100vh] flex justify-center items-center">
            <div className="entry-page-content">
                <div className="entry-image flex flex-col justify-center items-center mb-10 w-auto">
                    <img src="../../src/assets/Welcome.png" alt="" className="sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg" />
                    <h1 className="text-xl text-blue-600 font-bold min-[300px]:text-lg min-[300px]:text-center">Welcome To Employee Management System, Please Select Your Role to Proceed Further</h1>
                </div>
                <div className="buttons flex justify-center placeholder:items-center gap-5">
                    <Link to={"/auth/employee/login"}><Button className="bg-purple-600 text-white font-bold text-lg">Employee</Button></Link>
                    <Link to={"/auth/HR/signup"}><Button className="bg-purple-600 text-white font-bold text-lg">HR-Admin</Button> </Link>
                </div>
            </div>
        </div >
    )
}