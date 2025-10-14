import { createSlice } from "@reduxjs/toolkit";
import { HREmployeesPageAsyncReducer } from "../AsyncReducers/asyncreducer.js";
import { HandleDeleteHREmployees, HandlePostHREmployees, HandleGetHREmployees } from "../Thunks/HREmployeesThunk.js";

const HREmployeesSlice = createSlice({
    name: "HREmployees",
    initialState: {
        data: null, 
        isLoading: false,
        success: false,
        fetchData : false, 
        employeeData : null,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        HREmployeesPageAsyncReducer(builder, HandleGetHREmployees) 
        HREmployeesPageAsyncReducer(builder, HandlePostHREmployees)
        HREmployeesPageAsyncReducer(builder, HandleDeleteHREmployees)
    }
})

export default HREmployeesSlice.reducer