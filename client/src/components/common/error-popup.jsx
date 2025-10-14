import { useState } from "react"
export const ErrorPopup = ({ error }) => {
    return (
        <>
            <div className="error-popup-container fixed top-5 items-center border-2 border-gray-600 p-2 rounded-lg animate-jump-in animate-once animate-ease-linear min-[200px]:text-[12px] sm:text-[15px] bg-white">
                <div className="error-popup-content flex justify-center items-center gap-2">
                    <div className="error-img">
                        <img src="../../src/assets/error.png" alt="Error" className="md:w-8 min-[200px]:w-5" />
                    </div>
                    <div className="error-content">
                        <p className="">{error}</p>
                    </div> 
                </div>
            </div>
        </>
    )
}