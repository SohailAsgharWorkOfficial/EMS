import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/apiService";
import { DashboardEndPoints } from "../apis/APIsEndpoints";

export const HandleGetDashboard = createAsyncThunk("HandleGetDashboard", async (DashboardData, { rejectWithValue }) => {
    try {
        const { apiroute } = DashboardData
        const response = await apiService.get(`${DashboardEndPoints[apiroute]}`, { 
            withCredentials: true
        })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data); 
    }
})
