import { ErrorPopup } from "./error-popup"
import { Link } from "react-router-dom"

export const SignIn = ({ image, handlesigninform, handlesigninsubmit, targetedstate, statevalue, redirectpath }) => {
    return (
        <>
            {targetedstate.error.status ? <ErrorPopup error={targetedstate.error.message} /> : null}
            <div className="flex min-h-full flex-1 min-[200px]:flex-col md:flex-row md:items-center justify-center px-6 py-12 lg:px-8 md:gap-5">

                <div className="sm:mx-auto sm:w-full sm:max-w-sm lg:mx-10">
                    <img
                        alt="Your Company"
                        src={image}
                        className="mx-auto h-auto w-auto"
                    />
                </div>
                <div className="my-5 sm:mx-auto sm:w-full sm:max-w-sm lg:mx-10">
                    <h2 className="mb-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                    <form className="space-y-6" onSubmit={handlesigninsubmit}>
                        <div>
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
                                    value={statevalue.email}
                                    onChange={handlesigninform}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6 p-2"
                                />
                            </div>
                        </div>

                        <div> 
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <Link to={redirectpath}>
                                        <a className="font-semibold text-indigo-600 hover:text-indigo-500">
                                            Forgot password? 
                                        </a>
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={statevalue.password}
                                    onChange={handlesigninform}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6 p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}