import { Employee } from "../models/Employee.model.js"
import bcrypt from 'bcrypt'
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../mailtrap/emails.js"
import { GenerateJwtTokenAndSetCookiesEmployee } from "../utils/generatejwttokenandsetcookies.js"
import crypto from "crypto"
import { Organization } from "../models/Organization.model.js"


export const HandleEmplyoeeSignup = async (req, res) => {
    const { firstname, lastname, email, password, contactnumber } = req.body
    try {

        if (!firstname || !lastname || !email || !password || !contactnumber) {
            throw new Error("All Fields are required")
        }

        const organization = await Organization.findOne({ _id: req.ORGID })

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization or Company not found" })
        }

        try {
            // const checkEmployee = await Employee.findOne({ email: email })

            // if (checkEmployee) {
            //     return res.status(400).json({ success: false, message: `Employee already exists, please go to the login page or create new employee` })
            // }

            const hashedPassword = await bcrypt.hash(password, 10)
            const verificationcode = GenerateVerificationToken(6)

            const newEmployee = await Employee.create({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                contactnumber: contactnumber,
                role: "Employee",
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 5 * 60 * 1000,
                organizationID: organization._id
            })

            organization.employees.push(newEmployee._id)
            await organization.save()

            // GenerateJwtTokenAndSetCookiesEmployee(res, newEmployee._id, newEmployee.role, organization._id)
            // const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
            // SendVerificationEmailStatus: VerificationEmailStatus

            return res.status(201).json({ success: true, message: "Employee Registered Successfully", newEmployee: newEmployee.email, type: "EmployeeCreate" })

        } catch (error) {
            res.status(400).json({ success: false, message: "Oops! Something went wrong", error: error });
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "All Fields are required" })
    }
}

export const HandleEmplyoeeVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body

    try {
        const ValidateEmployee = await Employee.findOne({ verificationtoken: verificationcode, verificationtokenexpires: { $gt: Date.now() }, organizationID: req.ORGID })

        if (!ValidateEmployee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Verifiation Code" })
        }

        ValidateEmployee.isverified = true;
        ValidateEmployee.verificationtoken = undefined;
        ValidateEmployee.verificationtokenexpires = undefined;
        await ValidateEmployee.save()

        const SendWelcomeEmailStatus = await SendWelcomeEmail(ValidateEmployee.email, ValidateEmployee.firstname, ValidateEmployee.lastname)

        return res.status(200).json({ success: true, message: "Employee Email verified successfully", validatedEmployee: ValidateEmployee, SendWelcomeEmailStatus: SendWelcomeEmailStatus })

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleResetEmplyoeeVerifyEmail = async (req, res) => {
    const { email } = req.body

    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee.email) {
            return res.status(404).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Valid Email Address" })
        }

        if (employee.isverified) {
            return res.status(404).json({ success: false, message: "Employee Email Already verified" })
        }

        const verificationcode = GenerateVerificationToken(6)
        employee.verificationtoken = verificationcode
        employee.verificationtokenexpires = Date.now() + 5 * 60 * 1000
        await employee.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({ success: true, message: "Verification email sent successfully", SendVerificationEmailStatus: SendVerificationEmailStatus })

    } catch (error) {
        res.status(500).json({ success: false, message: "internal error", error: error })
    }
}


export const HandleEmplyoeeLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        const isMatch = await bcrypt.compare(password, employee.password)

        if (!isMatch) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        GenerateJwtTokenAndSetCookiesEmployee(res, employee._id, employee.role, employee.organizationID)
        employee.lastlogin = new Date()

        await employee.save()
        return res.status(200).json({ success: true, message: "Emplyoee Login Successfull" })

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }

}

export const HandleEmployeeCheck = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }
        return res.status(200).json({ success: true, message: "Employee Already Logged In" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal error" })
    }
}

export const HandleEmplyoeeLogout = async (req, res) => {
    try {
        res.clearCookie("EMtoken")
        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}

export const HandleEmplyoeeForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const employee = await Employee.findOne({ email: email, organizationID: req.ORGID })

        if (!employee) {
            return res.status(401).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Correct One" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60 // 1 hour

        employee.resetpasswordtoken = resetToken;
        employee.resetpasswordexpires = resetTokenExpires;
        await employee.save()

        const URL = `${process.env.CLIENT_URL}/auth/employee/resetpassword/${resetToken}`
        const SendForgotPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendForgotPasswordEmailStatus: SendForgotPasswordEmailStatus })

    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const HandleEmplyoeeSetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    try {
        if (req.cookies.token) {
            res.clearCookie("EMtoken")
        }
        const employee = await Employee.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        employee.password = hashedPassword
        employee.resetpasswordtoken = undefined
        employee.resetpasswordexpires = undefined
        await employee.save()

        const SendResetPasswordConfimationStatus = await SendResetPasswordConfimation(employee.email)
        return res.status(200).json({ success: true, message: "Password Reset Successful", SendResetPasswordConfimationStatus: SendResetPasswordConfimationStatus, resetpassword: true })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const HandleEmployeeCheckVerifyEmail = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", type: "Employeecodeavailable" })
        }

        if (employee.isverified) {
            return res.status(200).json({ success: false, message: "Employee Already Verified", type: "Employeecodeavailable" })
        }

        if ((employee.verificationtoken) && (employee.verificationtokenexpires > Date.now())) {
            return res.status(200).json({ success: true, message: "Verification Code is Still Valid", type: "Employeecodeavailable" })
        }

        return res.status(200).json({ success: false, message: "Invalid or Expired Verification Code", type: "Employeecodeavailable" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}