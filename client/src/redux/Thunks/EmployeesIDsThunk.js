import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/APIService";
import { EmployeesIDsEndPoints } from "../apis/APIsEndpoints";

const getErrorPayload = (error) => (
    error?.response?.data || { success: false, message: error?.message || "Network error" }
)

export const fetchEmployeesIDs = createAsyncThunk("fetchEmployeesIDs", async (fetchdata, { rejectWithValue }) => {
    try {
        const { apiroute } = fetchdata
        const response = await apiService.get(`${EmployeesIDsEndPoints[apiroute]}`, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error))
    }
})
