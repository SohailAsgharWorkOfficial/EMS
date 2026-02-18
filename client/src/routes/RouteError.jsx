import { isRouteErrorResponse, useRouteError } from "react-router-dom"

export const RouteError = () => {
    const error = useRouteError()

    let title = "Something went wrong"
    let description = "An unexpected error occurred. Please reload the page."

    if (isRouteErrorResponse(error)) {
        title = `${error.status} ${error.statusText}`
        description = error.data?.message || description
    } else if (error instanceof Error) {
        description = error.message
    }

    return (
        <div className="h-screen w-full flex items-center justify-center p-6">
            <div className="max-w-xl w-full border border-red-300 rounded-lg bg-red-50 p-6">
                <h1 className="text-2xl font-bold text-red-800">{title}</h1>
                <p className="mt-2 text-red-700">{description}</p>
            </div>
        </div>
    )
}
