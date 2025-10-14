import { ListWrapper } from "../../../components/common/Dashboard/ListDesigns"
import { HeadingBar } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { ListItems } from "../../../components/common/Dashboard/ListDesigns"
import { ListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { AddEmployeesDialogBox } from "../../../components/common/Dashboard/dialogboxes.jsx"
export const HREmployeesPage = () => {
    const dispatch = useDispatch()
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const table_headings = ["Full Name", "Email", "Department", "Contact Number", "Modify Employee"]

    useEffect(() => {
        if (HREmployeesState.fetchData) {
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        }
    }, [HREmployeesState.fetchData])

    useEffect(() => {
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    if (HREmployeesState.isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="employee-page-content w-full mx-auto my-10 flex flex-col gap-5 h-[94%]">
            <div className="employees-heading flex justify-between items-center md:pe-5">
                <h1 className="min-[250px]:text-xl md:text-4xl font-bold">Employees</h1>
                <div className="employee-crate-button">
                    <AddEmployeesDialogBox />
                </div>
            </div>
            <div className="employees-data flex flex-col gap-4 md:pe-5 overflow-auto">
                <ListWrapper>
                    <HeadingBar table_layout={"grid-cols-5"} table_headings={table_headings} />
                </ListWrapper>
                <ListContainer>
                    <ListItems TargetedState={HREmployeesState} />
                </ListContainer>
            </div>
        </div>
    )
}