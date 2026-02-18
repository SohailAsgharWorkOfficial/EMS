import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/APIService";
import { DashboardEndPoints } from "../apis/APIsEndpoints";

const getErrorPayload = (error) => (
    error?.response?.data || { success: false, message: error?.message || "Network error" }
)

export const HandleGetDashboard = createAsyncThunk("HandleGetDashboard", async (DashboardData, { rejectWithValue }) => {
    try {
        const { apiroute } = DashboardData
        const response = await apiService.get(`${DashboardEndPoints[apiroute]}`, { 
            withCredentials: true
        })
        return response.data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error)); 
    }
})

