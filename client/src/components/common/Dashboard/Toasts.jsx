import { useToast } from "../../../hooks/use-toast.js"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useRef } from "react"
import { HandlePostHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
export const FormSubmitToast = ({ formdata }) => {
    const { toast } = useToast()
    const dispatch = useDispatch()
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)


    const SubmitFormData = async () => {
        dispatch(HandlePostHREmployees({ apiroute: "ADDEMPLOYEE", data: formdata })) 
    }

    // const DisplayToast = () => {
    //     if (HREmployeesState.error.status) {
    //         return toast({
    //             variant: "destructive",
    //             title: "Uh oh! Something went wrong.",
    //             description: `${HREmployeesState.error.message}`,
    //             // action: <ToastAction altText="Try again">Try again</ToastAction>,
    //         })
    //     } else if (HREmployeesState.fetchData) {
    //         return toast({
    //             title: <p className="text-xl m-1">Success!</p>,
    //             description: <div className="flex justify-center items-center gap-2">
    //                 <img src="../../src/assets/HR-Dashboard/correct.png" alt="" className="w-8" />
    //                 <p className="font-bold">Employee added successfully.</p>
    //             </div>,
    //         })
    //     }
    // }

    console.log(HREmployeesState, "This is the HR plus Employees State")
    return (
        <>
            <Button
                variant="outline"
                onClick={() => {
                    SubmitFormData()
                    // HREmployeesState.error.status ? toast({
                    //     variant: "destructive",
                    //     title: "Uh oh! Something went wrong.",
                    //     description: `${HREmployeesState.error.message}`,
                    //     // action: <ToastAction altText="Try again">Try again</ToastAction>,
                    // }) : null
                    // HREmployeesState.fetchData ? toast({
                    //     title: <p className="text-xl m-1">Success!</p>,
                    //     description: <div className="flex justify-center items-center gap-2">
                    //         <img src="../../src/assets/HR-Dashboard/correct.png" alt="" className="w-8" />
                    //         <p className="font-bold">Employee added successfully.</p>
                    //     </div>,
                    // }) : null
                }}
                className="bg-blue-800 border-2 border-blue-800 px-4 py-2 text-white font-bold rounded-lg hover:bg-white hover:text-blue-800"
            >
                Add Employee
            </Button>
        </>
    )
}