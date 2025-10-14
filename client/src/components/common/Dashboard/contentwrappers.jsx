import { KeyDetailsBox } from "./keydetailboxes"
import { Link } from "react-router-dom"

export const ContentWraperMain = ({ children }) => {
    return (
        <div className="container h-full w-auto flex flex-col">
            {children ? children : null}
        </div>
    )
}

export const KeyDetailBoxContentWrapper = ({ imagedataarray, data }) => {
    return (
        <div className="key-details-box-content grid min-[250px]:grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-4 my-2">
            {imagedataarray.map((item) => <Link to={item.path}> <KeyDetailsBox image={item.image} dataname={item.dataname} 
            data={ data ?  data[item["dataname"]] : ""}/> </Link>)}
        </div>
    )
}
