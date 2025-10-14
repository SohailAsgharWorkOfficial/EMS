import { createSlice } from '@reduxjs/toolkit';
import { fetchEmployeesIDs } from '../Thunks/EmployeesIDsThunk.js';
import { EmployeesIDsAsyncReducer } from '../AsyncReducers/asyncreducer.js';

const EmployeesIDsSlice = createSlice({
    name: 'EmployeesIDs',
    initialState: {
        data: null,
        isLoading: false,
        isSuccess: false,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        EmployeesIDsAsyncReducer(builder, fetchEmployeesIDs)
    }
})

export default EmployeesIDsSlice.reducer