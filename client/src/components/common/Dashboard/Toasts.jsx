import { useToast } from "../../../hooks/use-toast.js"
import { Button } from "@/components/ui/button"
import { useDispatch } from "react-redux"
import { HandlePostHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
export const FormSubmitToast = ({ formdata }) => {
    const { toast } = useToast()
    const dispatch = useDispatch()


    const SubmitFormData = async () => {
        if (!formdata.firstname || !formdata.lastname || !formdata.email || !formdata.contactnumber || !formdata.textpassword || !formdata.password) {
            toast({
                variant: "destructive",
                title: "Missing fields",
                description: "Please fill all employee fields.",
            })
            return
        }

        if (formdata.textpassword !== formdata.password) {
            toast({
                variant: "destructive",
                title: "Password mismatch",
                description: "Password and confirm password must match.",
            })
            return
        }

        try {
            const result = await dispatch(HandlePostHREmployees({ apiroute: "ADDEMPLOYEE", data: formdata })).unwrap()
            toast({
                title: "Success",
                description: result?.message || "Employee added successfully.",
            })
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed",
                description: error?.message || "Employee create failed.",
            })
        }
    }
    return (
        <>
            <Button
                variant="outline"
                onClick={() => {
                    SubmitFormData()
                }}
                className="bg-blue-800 border-2 border-blue-800 px-4 py-2 text-white font-bold rounded-lg hover:bg-white hover:text-blue-800"
            >
                Add Employee
            </Button>
        </>
    )
}
