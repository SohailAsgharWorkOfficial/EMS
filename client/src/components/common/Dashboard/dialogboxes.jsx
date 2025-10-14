import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ErrorPopup } from "../error-popup.jsx"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { CommonStateHandler } from "../../../utils/commonhandler.js"
import { useDispatch, useSelector } from "react-redux"
import { FormSubmitToast } from "./Toasts.jsx"
import { Loading } from "../loading.jsx"
import { HandleDeleteHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk.js"
import { useToast } from "../../../hooks/use-toast.js"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { fetchEmployeesIDs } from "../../../redux/Thunks/EmployeesIDsThunk.js"


export const AddEmployeesDialogBox = () => {
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const [formdata, setformdata] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        textpassword: "",
        password: "",
    })

    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }

    return (
        <div className="AddEmployees-content">
            <Dialog>
                <DialogTrigger className="bg-blue-800 border-2 border-blue-800 md:px-4 md:py-2 md:text-lg min-[250px]:px-2 min-[250px]:py-1 min-[250px]:text-sm text-white font-bold rounded-lg hover:bg-white hover:text-blue-800">Add Employees</DialogTrigger>
                <DialogContent className="max-w-[315px] sm:max-w-[50vw] 2xl:max-w-[45vw]">
                    <div className="add-employees-container flex flex-col gap-5">
                        <div className="heading">
                            <h1 className="font-bold text-2xl">Add Employee Info</h1>
                        </div>
                        <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                            <div className="form-group flex flex-col gap-3">
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="firstname" className="md:text-md lg:text-lg font-bold">First Name</label>
                                    <input type="text"
                                        id="firstname"
                                        className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="firstname"
                                        value={formdata.firstname}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="lastname" className="md:text-md lg:text-lg font-bold">Last Name</label>
                                    <input type="text"
                                        id="lastanme"
                                        className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="lastname"
                                        value={formdata.lastname}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="email" className="md:text-md lg:text-lg font-bold">Email</label>
                                    <input type="email"
                                        id="email" required={true} className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="email"
                                        value={formdata.email}
                                        onChange={handleformchange} />
                                </div>
                            </div>
                            <div className="form-group flex flex-col gap-3">
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="contactnumber" className="md:text-md lg:text-lg font-bold">Contact Number</label>
                                    <input type="number"
                                        id="contactnumber" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="contactnumber"
                                        value={formdata.contactnumber}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="text-password" className="md:text-md lg:text-lg font-bold">Password</label>
                                    <input type="text"
                                        id="text-password" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="textpassword"
                                        value={formdata.textpassword}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="password" className="md:text-md lg:text-lg font-bold">Confirm Password</label>
                                    <input type="password"
                                        id="password" required={true} className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="password"
                                        value={formdata.password}
                                        onChange={handleformchange} />
                                </div>
                            </div>
                        </div>
                        <div className="add-button flex items-center justify-center">
                            <FormSubmitToast formdata={formdata} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export const EmployeeDetailsDialogBox = ({ EmployeeID }) => {
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const FetchEmployeeData = (EmID) => {
        const employee = HREmployeesState.data.find((item) => item._id === EmID)
        return employee
    }
    const employeeData = FetchEmployeeData(EmployeeID)
    return (
        <div className="Employees-Details-container">
            <Dialog>
                <div>
                    <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">View</DialogTrigger>
                </div>
                <DialogContent className="max-w-[315px] lg:max-w-[55vw] 2xl:max-w-[45vw]">
                    <div className="employee-data-container flex flex-col gap-4">
                        <div className="employee-profile-logo flex items-center gap-3">
                            <div className="logo border-2 border-blue-800 rounded-[50%] flex justify-center items-center">
                                <p className="font-bold text-2xl text-blue-700 p-2">{`${employeeData.firstname.slice(0, 1).toUpperCase()} ${employeeData.lastname.slice(0, 1).toUpperCase()}`}</p>
                            </div>
                            <div className="employee-fullname">
                                <p className="font-bold text-2xl">{`${employeeData.firstname} ${employeeData.lastname}`}</p>
                            </div>
                        </div>
                        <div className="employees-all-details grid lg:grid-cols-2 min-[250px]:gap-2 lg:gap-10">
                            <div className="details-group-1 flex flex-col gap-3">
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">First Name :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.firstname}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Last Name :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.lastname}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Email :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.email}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Contact Number :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.contactnumber}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Department :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.department ? employeeData.department.name : "Not Specified"}</p>
                                </div>
                            </div>
                            <div className="details-group-1 flex flex-col gap-3">
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Notices :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.notice.length}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Salary Records :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.salary.length}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Leave Requests :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.leaverequest.length}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Requests :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.generaterequest.length}</p>
                                </div>
                                <div className="label-value-pair flex items-center gap-2">
                                    <label className="font-bold md:text-sm xl:text-lg">Email Verify :</label>
                                    <p className="md:text-sm xl:text-lg">{employeeData.isverified ? "Verified" : "Not Verified"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export const DeleteEmployeeDialogBox = ({ EmployeeID }) => {
    const dispatch = useDispatch()
    const DeleteEmployee = (EMID) => {
        dispatch(HandleDeleteHREmployees({ apiroute: `DELETE.${EMID}` }))
    }
    return (
        <div className="delete-employee-dialog-container">
            <Dialog>
                <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">Delete</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    <div className="flex flex-col justify-center items-center gap-4">
                        <p className="text-lg font-bold min-[250px]:text-center">Are you sure you want to delete this employee?</p>
                        <div className="delete-employee-button-group flex gap-2">
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-red-700 border-red-700 hover:bg-transparent hover:text-red-700" onClick={() => DeleteEmployee(EmployeeID)}>Delete</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-green-700 border-green-700 hover:bg-transparent hover:text-green-700">Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}



export const CreateDepartmentDialogBox = () => {
    const { toast } = useToast()
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({
        name: "",
        description: ""
    })

    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }

    const CreateDepartment = () => {
        dispatch(HandlePostHRDepartments({ apiroute: "CREATE", data: formdata }))
        setformdata({
            name: "",
            description: ""
        })
    }

    const ShowToast = () => {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `All Fields are required to create a department`,
        })
    }

    return (
        <Dialog>
            <DialogTrigger className="min-[250px]:text-sm sm:text-lg min-[250px]:px-2 min-[250px]:py-1 sm:px-4 sm:py-2 bg-blue-700 font-bold text-white rounded-lg border-2 border-blue-700 hover:bg-white hover:text-blue-700">Create Department</DialogTrigger>
            <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                <div className="create-department-container flex flex-col gap-4">
                    <div className="create-department-heading">
                        <h1 className="font-bold text-2xl">Create Department</h1>
                    </div>
                    <div className="create-department-form flex flex-col gap-4">
                        <div className="form-group flex flex-col gap-3">
                            <div className="label-input-field flex flex-col gap-1">
                                <label htmlFor="departmentname" className="md:text-md lg:text-lg font-bold">Department Name</label>
                                <input type="text"
                                    id="departmentname"
                                    name="name"
                                    value={formdata.name}
                                    onChange={handleformchange}
                                    placeholder="Enter Department Name"
                                    className="border-2 border-gray-700 rounded px-2 py-1" />
                            </div>
                            <div className="label-input-field flex flex-col gap-1">
                                <label htmlFor="departmentdescription" className="md:text-md lg:text-lg font-bold">Department Description</label>
                                <textarea
                                    id="departmentdescription"
                                    name="description"
                                    value={formdata.description}
                                    onChange={handleformchange}
                                    className="border-2 border-gray-700 rounded px-2 py-1 h-[100px]"
                                    placeholder="Write Your Department Description Here"></textarea>
                            </div>
                        </div>
                        <div className="create-department-button flex justify-center items-center">
                            {
                                (formdata.name.trim().length === 0 || formdata.description.trim().length === 0) ? <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-md hover:bg-white hover:text-blue-700" onClick={() => ShowToast()}>Create</Button> :
                                    <DialogClose asChild>
                                        <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-md hover:bg-white hover:text-blue-700" onClick={() => CreateDepartment()}>Create</Button>
                                    </DialogClose>
                            }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}



export const EmployeesIDSDialogBox = ({ DepartmentID }) => {
    console.log("this is Department ID", DepartmentID)
    const EmployeesIDState = useSelector((state) => state.EMployeesIDReducer)
    const dispatch = useDispatch()
    const [SelectedEmployeesData, Set_selectedEmployeesData] = useState({
        departmentID: DepartmentID,
        employeeIDArray: [],
    })

    const SelectEmployees = (EMID) => {
        if (SelectedEmployeesData.employeeIDArray.includes(EMID)) {
            Set_selectedEmployeesData({ ...SelectedEmployeesData, employeeIDArray: SelectedEmployeesData.employeeIDArray.filter((item) => item !== EMID) })
        }
        else if (!SelectedEmployeesData.employeeIDArray.includes(EMID)) {
            Set_selectedEmployeesData({ ...SelectedEmployeesData }, SelectedEmployeesData.employeeIDArray.push(EMID))
        }
    }

    const ClearSelectedEmployeesData = () => {
        Set_selectedEmployeesData({
            departmentID: DepartmentID,
            employeeIDArray: []
        })
    }

    const SetEmployees = () => {
        dispatch(HandlePatchHRDepartments({ apiroute: "UPDATE", data: SelectedEmployeesData }))
        ClearSelectedEmployeesData()
    }

    console.log(SelectedEmployeesData)

    useEffect(() => {
        Set_selectedEmployeesData(
            {
                departmentID: DepartmentID,
                employeeIDArray: [],
            }
        )
    }, [DepartmentID])

    return (
        <div className="employeeIDs-box-container">
            <Dialog>
                <DialogTrigger className="px-4 py-2 font-bold m-2 bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-white hover:text-blue-700 min-[250px]:text-xs md:text-sm lg:text-lg" onClick={() => dispatch(fetchEmployeesIDs({ apiroute: "GETALL" }))}>Add Employees</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    {EmployeesIDState.isLoading ? <Loading height={"h-auto"} /> : <div className="employeeID-checkbox-container flex flex-col gap-4">
                        <div>
                            <h1 className="font-bold text-2xl">Select Employees</h1>
                        </div>
                        <div className="employeeID-checkbox-group">
                            <Command className="rounded-lg border shadow-md w-full">
                                <CommandInput placeholder="Type a Employee Name..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="All Employees">
                                        {EmployeesIDState.data ? EmployeesIDState.data.map((item, index) => <CommandItem key={index}>
                                            <div className="employeeID-checkbox flex justify-center items-center gap-2">
                                                <input type="checkbox" id={`EmployeeID-${index + 1}`} className="border-2 border-gray-700 w-4 h-4" onClick={() => SelectEmployees(item._id)} checked={SelectedEmployeesData.employeeIDArray.includes(item._id)} disabled={item.department ? true : false} />
                                                <label htmlFor={`EmployeeID-${index + 1}`} className="text-lg">{`${item.firstname} ${item.lastname}`} <span className="text-xs mx-0.5 overflow-hidden text-ellipsis">{item.department ? `(${item.department.name})` : null}</span> </label>
                                            </div>
                                        </CommandItem>) : null}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                        <div className="employeeID-checkbox-button-group flex justify-center items-center gap-2">
                            <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-lg hover:bg-white hover:text-blue-700" onClick={() => SetEmployees()}>Add</Button>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-lg hover:bg-white hover:text-blue-700" onClick={() => ClearSelectedEmployeesData()}>Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>}

                </DialogContent>
            </Dialog>
        </div>
    )
}

export const RemoveEmployeeFromDepartmentDialogBox = ({ DepartmentName, DepartmentID, EmployeeID }) => {
    const dispatch = useDispatch()

    const RemoveEmployee = (EMID) => {
        dispatch(HandleDeleteHRDepartments({ apiroute: "DELETE", data: { departmentID: DepartmentID, employeeIDArray: [EMID], action: "delete-employee" } }))
    }

    return (
        <div className="remove-employee">
            <Dialog>
                <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">Remove</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    <div className="flex flex-col justify-center items-center gap-4">
                        <p className="text-lg font-bold min-[250px]:text-center">{`Are you sure you want to remove this employee from ${DepartmentName} department ?`}</p>
                        <div className="delete-employee-button-group flex gap-2">
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-red-700 border-red-700 hover:bg-transparent hover:text-red-700" onClick={() => RemoveEmployee(EmployeeID)}>Remove</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-green-700 border-green-700 hover:bg-transparent hover:text-green-700">Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}