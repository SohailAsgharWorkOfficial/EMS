import { Link } from 'react-router-dom'
export const ResetEmailConfirmaction = ({ redirectpath }) => {
    return (
        <div className="email-reset-container h-[100vh] flex justify-center items-center">
            <div className="reset-email-conetent flex min-h-full flex-1 min-[200px]:flex-col md:flex-row md:items-center justify-center px-6 py-12 lg:px-8 md:gap-5">
                <div className="reset-email-img sm:mx-auto sm:w-full sm:max-w-sm lg:mx-10">
                    <img src="../../src/assets/sendemail.png" alt="Send-Email" className="mx-auto h-auto w-auto" />
                </div>
                <div className="reset-email-content my-5 sm:mx-auto sm:w-full sm:max-w-sm lg:mx-5 md:w-full flex flex-col justify-center min-[200px]:text-center md:text-start  min-[200px]:items-center md:items-start gap-3">
                    <p className="md:text-lg text-green-600 font-bold sm:text-sm lg:text-xl">We have successfully send you a Reset email, Click on The Reset Password To Reset Your Password.</p>
                    <p className="md:text-lg text-red-600 font-bold sm:text-sm lg:text-xl">Please do not forward reset passowrd email</p>
                    <div className="back-login-button">
                        <Link to={redirectpath} className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}