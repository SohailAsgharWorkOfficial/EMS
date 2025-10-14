import { ResetEmailConfirmaction } from "../../components/common/reset-email-confirm.jsx"
export const ResetEmailConfirm = () => { 
    return (
        <>
            <ResetEmailConfirmaction redirectpath={"/auth/employee/login"} />
        </>
    )
}