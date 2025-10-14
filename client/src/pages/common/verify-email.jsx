import { Button } from "@/components/ui/button"
import { ErrorPopup } from "../../components/common/error-popup"
export const ResetVerifyEmailPage = ({ handleverifyemail, handleverifybutton, emailvalue, targetstate}) => {
    return (
        <>

            <div className="verify-email-container">
                <div className="verify-email-content h-[100vh] min-[250px]:flex-col min-[250px]:items-center md:flex-row flex justify-center">
                    {targetstate.error.status ? <ErrorPopup error={targetstate.error.message} /> : null}
                    <div className="img flex justify-center items-center">
                        <img src="../../src/assets/verify-email.png" alt="" className="min-[250px]:max-w-xs lg:max-w-sm 2xl:max-w-md" />
                    </div>

                    <div className="form-content flex flex-col gap-3 min-[250px]:items-center md:items-start justify-center">
                        <div>
                            <h1 className="text-lg font-bold">Verify Your Email Address</h1>
                        </div>
                        <div className="min-[250px]:flex min-[250px]:flex-col min-[250px]:items-center md:items-start">
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={emailvalue}
                                    onChange={handleverifyemail}
                                    className="block p-2 min-[250px]:w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[28vw] 2xl:w-[20vw] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div className="verify-email-button">
                            <Button className="bg-blue-700 text-white font-bold hover:bg-blue-300 hover:text-blue-700" onClick={handleverifybutton}>Verify Email</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}