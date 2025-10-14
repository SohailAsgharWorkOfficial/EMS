import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailtemplates.js"
import { Emailclient, sender } from "./mailtrap.config.js"

export const SendVerificationEmail = async (email, verificationcode) => {
    const receiver = [{ email }]
    try {
        const response = await Emailclient.send({
            from: sender,
            to: receiver,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationcode),
            category: "Email verification"
        })
        // console.log("Verification email sent successfully", response)
        return response.success
    } catch (error) {
        console.log(error.message)
        return false
    }
}

export const SendWelcomeEmail = async (email, firstname, lastname, role) => {
    const receiver = [{ email }]
    if (role == "HR-Admin") {
        try {
            const response = await Emailclient.send({
                from: sender,
                to: receiver,
                template_uuid: "4749eba4-dc99-4658-923e-54ccd0c0b99c",
                template_variables: {
                    "company_info_name": "Your Company Name - [EMS]",
                    "name": `${firstname}${lastname} - HR`
                }
            })
            // console.log("Welcome email sent successfully", response)
            return response.success
        } catch (error) {
            console.log(error.message)
            return false
        }
    }
    else {
        try {
            const response = await Emailclient.send({
                from: sender,
                to: receiver,
                template_uuid: "cf9f23f4-ebfb-4baa-a69e-bcb76487ac24",
                template_variables: {
                    "company_info_name": "Company Name - (EMS)",
                    "name": `${firstname} ${lastname}`,
                }
            })
            // console.log("Welcome email sent successfully", response)
            return response.success
        } catch (error) {
            console.log(error.message)
            return false
        }
    }
}

export const SendForgotPasswordEmail = async (email, resetURL) => {
    const receiver = [{ email }]
    try {
        const response = await Emailclient.send({
            from: sender,
            to: receiver,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset Email"
        })
        // console.log("Forgot Password email sent successfully", response)
        return response.success
    } catch (error) {
        console.log(error.message)
        return false
    }
}

export const SendResetPasswordConfimation = async (email) => {
    const receiver = [{ email }]
    try {
        const response = await Emailclient.send({
            from: sender,
            to: receiver,
            subject: "Password Reset Successfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset Confirmation"
        })
        // console.log("Reset Password confirmation email sent successfully", response)
        return response.success
    } catch (error) {
        console.log(error.message)
        return false
    }
}