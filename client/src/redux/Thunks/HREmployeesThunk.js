import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/APIService";
import { HREmployeesPageEndPoints } from "../apis/APIsEndpoints";

const getErrorPayload = (error) => (
    error?.response?.data || { success: false, message: error?.message || "Network error" }
)

export const HandleGetHREmployees = createAsyncThunk('HandleGetHREmployees', async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = HREmployeeData
        const response = await apiService.get(`${HREmployeesPageEndPoints[apiroute]}`, {
            withCredentials: true
        })
        return response.data
    }

    catch (error) {
        return rejectWithValue(getErrorPayload(error));
    }
}) 

export const HandlePostHREmployees = createAsyncThunk('HandlePostHREmploy', async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HREmployeeData
        const response = await apiService.post(`${HREmployeesPageEndPoints[apiroute]}`, data, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error));
    }
})

export const HandleDeleteHREmployees = createAsyncThunk("HandleDeleteHREmployees", async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = HREmployeeData
        const RouteArray = apiroute.split(".")
        if (RouteArray.length > 0) {
            const response = await apiService.delete(`${HREmployeesPageEndPoints[RouteArray[0]](RouteArray[1])}`, {
                withCredentials : true
            })
            return response.data
        }
    } catch (error) {
        return rejectWithValue(getErrorPayload(error));
    }
})
