import { createSlice } from "@reduxjs/toolkit";
import { HandleGetHRDepartments, HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../Thunks/HRDepartmentPageThunk";
import { HRDepartmentPageAsyncReducer } from "../AsyncReducers/asyncreducer";

const HRDepartmentPageSlice = createSlice({
    name: "HRDepartmentPage",
    initialState: {
        data: null,
        isLoading: false,
        fetchData: false,
        success: {
            status: false,
            message: null,
            content: null
        },
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        HRDepartmentPageAsyncReducer(builder, HandleGetHRDepartments);
        HRDepartmentPageAsyncReducer(builder, HandlePostHRDepartments);
        HRDepartmentPageAsyncReducer(builder, HandlePatchHRDepartments);
        HRDepartmentPageAsyncReducer(builder, HandleDeleteHRDepartments);
    }
})

export default HRDepartmentPageSlice.reducer