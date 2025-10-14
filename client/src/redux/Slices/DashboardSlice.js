import { createSlice } from "@reduxjs/toolkit";
import { HRDashboardAsyncReducer } from "../AsyncReducers/asyncreducer";
import { HandleGetDashboard } from "../Thunks/DashboardThunk";

const HRDashboardSlice = createSlice({
    name: "HRDashboard",
    initialState: {
        data: null,
        isLoading: false,
        success : false, 
        error: {
            status: false,
            message: null,
            content: null,
        }
    },
    extraReducers: (builder) => {
        HRDashboardAsyncReducer(builder, HandleGetDashboard);
    },
})

export default HRDashboardSlice.reducer