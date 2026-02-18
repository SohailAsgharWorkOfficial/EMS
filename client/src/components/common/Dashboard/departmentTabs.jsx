import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSelector, useDispatch } from "react-redux"
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk"
import { HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk"
import { Loading } from "../loading.jsx"
import { HeadingBar } from "./ListDesigns.jsx"
import { DepartmentListItems } from "./ListDesigns.jsx"
import { useToast } from "../../../hooks/use-toast.js"
import { EmployeesIDSDialogBox } from "./dialogboxes.jsx"



export const HRDepartmentTabs = () => {
    const { toast } = useToast()
    const HRDepartmentState = useSelector((state) => state.HRDepartmentPageReducer)
    const dispatch = useDispatch()
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("all")

    const departments = Array.isArray(HRDepartmentState.data)
        ? HRDepartmentState.data.map((item) => ({
            value: item._id,
            label: item.name
        }))
        : []

    const currentDepartmentData = selectedDepartmentId === "all"
        ? null
        : (HRDepartmentState.data || []).find((item) => item._id === selectedDepartmentId)

    useEffect(() => {
        if (HRDepartmentState.fetchData) {
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
        }

        if (HRDepartmentState.error.status) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: `${HRDepartmentState.error.message}`,
            })
        }

        if (HRDepartmentState.success.status) {
            toast({
                title: <p className="text-xl m-1">Success!</p>,
                description: <div className="flex justify-center items-center gap-2">
                    <img src="../../src/assets/HR-Dashboard/correct.png" alt="" className="w-6" />
                    <p className="font-bold">{HRDepartmentState.success.message}</p>
                </div>,
            })
        }

        console.log("test message")

    }, [HRDepartmentState.fetchData, HRDepartmentState.error, HRDepartmentState.success, dispatch, toast])


    useEffect(() => {
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
    }, [dispatch])

    useEffect(() => {
        if (selectedDepartmentId === "all") return
        if (!currentDepartmentData) {
            setSelectedDepartmentId("all")
        }
    }, [selectedDepartmentId, currentDepartmentData])


    if (HRDepartmentState.isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="flex flex-col gap-4 bg-blue-50 min-[250px]:p-1 sm:p-4 rounded-lg h-[100%] overflow-auto">
            <div className="Dropdown-container flex justify-between items-center">
                <div className="drop-down-select flex items-center gap-2 min-[250px]:flex-col sm:flex-row">
                    <h1 className="font-bold sm:text-sm lg:text-lg min-[250px]:hidden sm:flex">Department : </h1>
                    <ComboDropDown DepartmentData={departments} CurrentDepartment={selectedDepartmentId} SetCurrentDepartment={setSelectedDepartmentId} />
                </div>
                <div className="update-delete-department">
                    {currentDepartmentData ?
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button className="bg-blue-700 hover:bg-blue-900">
                                    <img src="../../src/assets/HR-Dashboard/settings.png" alt="" className="w-5" />
                                    <span className="min-[250px]:hidden sm:flex">Settings</span></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="flex flex-col justify-center items-center p-2">
                                {/* <DropdownMenuLabel>Update or Delete The Department</DropdownMenuLabel> */}
                                <div className="buttons flex flex-col gap-2">
                                    <Button
                                        className="bg-blue-700 text-white font-bold text-sm hover:bg-blue-900"
                                        onClick={() => {
                                            const updatedName = window.prompt("Enter updated department name", currentDepartmentData.name)
                                            const updatedDescription = window.prompt("Enter updated department description", currentDepartmentData.description)
                                            if (!updatedName || !updatedDescription) return
                                            dispatch(HandlePatchHRDepartments({
                                                apiroute: "UPDATE",
                                                data: {
                                                    departmentID: currentDepartmentData._id,
                                                    UpdatedDepartment: {
                                                        name: updatedName.trim(),
                                                        description: updatedDescription.trim(),
                                                    }
                                                }
                                            }))
                                        }}
                                    >
                                        <img src="../../src/assets/HR-Dashboard/update.png" alt="" className="w-5" />
                                        Update
                                    </Button>
                                    <Button
                                        className="bg-red-700 text-white font-bold text-sm hover:bg-red-900"
                                        onClick={() => {
                                            const confirmed = window.confirm(`Delete ${currentDepartmentData.name} department?`)
                                            if (!confirmed) return
                                            dispatch(HandleDeleteHRDepartments({
                                                apiroute: "DELETE",
                                                data: {
                                                    departmentID: currentDepartmentData._id,
                                                    action: "delete-department"
                                                }
                                            }))
                                            setSelectedDepartmentId("all")
                                        }}
                                    >
                                        <img src="../../src/assets/HR-Dashboard/delete.png" alt="" className="w-5" />
                                        Delete
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu> : null}
                </div>
            </div>
            <div className={`department-container min-[250px]:px-1 sm:px-4 rounded-lg flex flex-col gap-4 h-[100%]`}>
                {
                    selectedDepartmentId === "all"
                        ? <AllDepartments DepartmentData={HRDepartmentState} SetCurrentDepartment={setSelectedDepartmentId} />
                        : (currentDepartmentData ? <DepartmentContent CurrentDepartmentData={currentDepartmentData} /> : null)
                }
            </div>
        </div>

    )
}


export const ComboDropDown = ({ DepartmentData, CurrentDepartment, SetCurrentDepartment }) => {

    const [open, setOpen] = useState(false)

    const currentDepartmentLabel = CurrentDepartment === "all"
        ? "All Departments"
        : (DepartmentData.find((item) => item.value === CurrentDepartment)?.label || "All Departments")

    return (
        <div className="departments-container">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className="border-2 border-blue-500 w-4">
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-auto justify-between"
                    >
                        {currentDepartmentLabel}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Command>
                        <CommandInput placeholder="Search Departments..." />
                        <CommandList>
                            <CommandEmpty>No Departments found.</CommandEmpty>
                            <CommandGroup className="sm:text-sm lg:text-lg">
                                {DepartmentData.map((department) => (
                                    <CommandItem
                                        key={department.value}
                                        value={department.value}
                                        onSelect={(currentValue) => {
                                            SetCurrentDepartment(currentValue === CurrentDepartment ? "all" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                CurrentDepartment === department.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {department.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}


export const DepartmentContent = ({ CurrentDepartmentData }) => {
    const table_headings_employees = ["Full Name", "Email", "Contact Number", "Remove Employee"]
    const table_headings_notice = ["Title", "Audience", "Createdby", "View Notice"]

    return (
        <>
            <div className="department-heading-description flex flex-col gap-4 min-[250px]:items-center sm:items-start">
                <h1 className="font-bold min-[250px]:text-xl sm:text-2xl lg:text-4xl">{CurrentDepartmentData.name}</h1>
                <p className="font-bold min-[250px]:text-xs sm:text-sm lg:text-lg min-[250px]:text-center sm:text-start">
                    {CurrentDepartmentData.description}
                </p>
            </div>
            <Tabs defaultValue="account" className="w-full h-[100%]">
                <div className="tabs-with-button flex justify-between items-center min-[250px]:flex-col-reverse sm:flex-row">
                    <TabsList className="min-[250px]:max-w-[250px] md:max-w-[300px] bg-blue-200 text-blue-700 my-3 min-[250px]:flex min-[250px]:flex-col min-[250px]:py-14 min-[350px]:flex min-[350px]:flex-row min-[350px]:py-6">
                        <TabsTrigger value="account" className="px-4 py-2 font-bold m-2 min-[250px]:text-xs md:text-sm">
                            <span className="text-blue-700">{CurrentDepartmentData.employees.length} Employees</span>
                        </TabsTrigger>
                        <TabsTrigger value="password" className="px-4 py-2 font-bold m-2 min-[250px]:text-xs md:text-sm">
                            <span className="text-blue-700">{CurrentDepartmentData.notice.length} Notice</span>
                        </TabsTrigger>
                    </TabsList>
                    <div className="edd-employees-dialog-box">
                        <EmployeesIDSDialogBox DepartmentID={CurrentDepartmentData._id} />
                    </div>
                </div>
                <TabsContent value="account" className={`border-2 border-blue-500 rounded-lg min-[250px]:h-[100%] md:h-[85%] min-[1650px]:h-[90%] overflow-auto p-2`}>
                    <HeadingBar table_layout={"grid-cols-4"} table_headings={table_headings_employees} />
                    <DepartmentListItems TargetedState={CurrentDepartmentData} />
                </TabsContent>
                <TabsContent value="password" className={`border-2 border-blue-500 rounded-lg min-[250px]:h-[100%] md:h-[85%] min-[1650px]:h-[90%] overflow-auto p-2`}>
                    <HeadingBar table_layout={"grid-cols-4"} table_headings={table_headings_notice} />
                </TabsContent>
            </Tabs>
        </>
    )
}


export const AllDepartments = ({ DepartmentData, SetCurrentDepartment }) => {
    return (
        <>
            {DepartmentData.data ? DepartmentData.data.map((department) => <div key={department._id} className="department-data border-2 border-blue-700 p-4 rounded-lg flex flex-col gap-4">
                <div className="department-heading-description flex justify-between items-center min-[250px]:items-center sm:items-start">
                    <h1 className="font-bold min-[250px]:text-xl sm:text-2xl lg:text-4xl">{department.name}</h1>
                    <Button className="bg-blue-700 border-2 border-blue-700 text-white font-bold hover:bg-white hover:text-blue-700" onClick={() => SetCurrentDepartment(department._id)}>View</Button>
                </div>
                <p className="font-bold min-[250px]:text-xs  sm:text-sm lg:text-lg min-[250px]:text-center sm:text-start">
                    {department.description}
                </p>
            </div>) : null}
        </>
    )
}
