import jwt from 'jsonwebtoken'

const isJwtAuthError = (error) => {
    return error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError" || error?.name === "NotBeforeError"
}

export const VerifyEmployeeToken = (req, res, next) => {
    const token = req.cookies.EMtoken
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin : true })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        if (!decoded) {
            res.clearCookie("EMtoken")
            return res.status(403).json({ success: false, message: "unauthenticated employee", gologin : true }) 
        }
        req.EMid = decoded.EMid
        req.EMrole = decoded.EMrole
        req.ORGID = decoded.ORGID
        next()
    } catch (error) {
        if (isJwtAuthError(error)) {
            res.clearCookie("EMtoken")
            return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
        }
        return res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const VerifyhHRToken = (req, res, next) => {
    const token = req.cookies.HRtoken
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin : true }) 
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        if (!decoded) {
            res.clearCookie("HRtoken")
            return res.status(403).json({ success: false, message: "unauthenticated employee", gologin : true })
        }
        req.HRid = decoded.HRid
        req.ORGID = decoded.ORGID
        req.Role = decoded.HRrole
        next()
    } catch (error) {
        if (isJwtAuthError(error)) {
            res.clearCookie("HRtoken")
            return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
        }
        return res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}
