export const AsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error.status = false;
            state.data = action.payload;
            if (action.payload.resetpassword) {
                state.isAuthenticated = false;
                state.isResetPasswords = action.payload.success
            }
            else {
                state.isAuthenticated = action.payload.success;
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.gologin) {
                state.isLoading = false;
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
};

export const HRAsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if ((action.payload.type == "checkHR") || (action.payload.type == "HRLogin") || (action.payload.type == "HRforgotpassword")) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRverifyemail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = false
                state.isVerified = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRcodeavailable") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                if (action.payload.alreadyverified) {
                    state.isVerified = true
                }
                else {
                    state.isVerified = false
                }
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.resetpassword) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = false;
                state.isResetPassword = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRResendVerifyEmail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = false
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            if (action.payload.type == "HRcodeavailable") {
                // state.isSignUp = true
                state.isLoading = false;
                // state.isAuthenticated = true
                state.isVerified = false
                state.isVerifiedEmailAvailable = false
                state.error.status = false;
                state.error.content = action.payload
            }
            if (action.payload.gologin) {
                state.isSignUp = false
                state.isLoading = false;
                state.isAuthenticated = false
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
}


export const HRDashboardAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.data = action.payload.data;
        state.success = action.payload.success
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload;
    })
}

export const HREmployeesPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.payload.type === "AllEmployees") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success
            state.fetchData = false
        }
        else if (action.payload.type === "EmployeeCreate" || action.payload.type === "EmployeeDelete") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success;
            state.fetchData = true
        }
        else if (action.payload.type === "GetEmployee") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.employeeData = action.payload.data
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        console.log(action)
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.success = action.payload.success;
        state.error.content = action.payload;
    })
}

export const HRDepartmentPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.payload.type === "AllDepartments") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.fetchData = false
            state.success.status = false
            state.success.message = null
            state.success.content = null
        }
        else if (action.payload.type === "CreateDepartment" || 
            action.payload.type === "DepartmentDelete" || 
            action.payload.type === "DepartmentEMUpdate" || 
            action.payload.type === "RemoveEmployeeDE") 
            {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.success.status = action.payload.success;
            state.success.message = action.payload.message;
            state.success.content = action.payload;
            state.fetchData = true
        }
        else if (action.payload.type === "GetDepartment") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.departmentData = action.payload.data
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.success = action.payload.success;
        state.error.content = action.payload;
    })
}


export const EmployeesIDsAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.message = null;
        state.error.content = null
        state.error.status = false;
        state.data = action.payload.data;
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload
    })
}