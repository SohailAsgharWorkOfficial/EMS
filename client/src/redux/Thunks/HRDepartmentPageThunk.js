import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/apiService";
import { HRDepartmentPageEndPoints } from "../apis/APIsEndpoints";

export const HandleGetHRDepartments = createAsyncThunk('HandleGetHRDepartments', async (HRDepartmentPageData, { rejectWithValue }) => {
    try {
        const { apiroute } = HRDepartmentPageData;
        const response = await apiService.get(`${HRDepartmentPageEndPoints[apiroute]}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const HandlePostHRDepartments = createAsyncThunk('HandlePostHRDepartments', async (HRDepartmentPageData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HRDepartmentPageData;
        const response = await apiService.post(`${HRDepartmentPageEndPoints[apiroute]}`, data, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const HandlePatchHRDepartments = createAsyncThunk('HandlePatchHRDepartments', async (HRDepartmentPageData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HRDepartmentPageData;
        const response = await apiService.patch(`${HRDepartmentPageEndPoints[apiroute]}`, data, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const HandleDeleteHRDepartments = createAsyncThunk("HandleDeleteHRDepartments", async (HRDepartmentPageData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HRDepartmentPageData;
        const response = await apiService.delete(`${HRDepartmentPageEndPoints[apiroute]}`, {
            data: data,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});