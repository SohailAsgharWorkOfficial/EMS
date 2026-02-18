import jwt from 'jsonwebtoken'

export const GenerateJwtTokenAndSetCookiesEmployee = (res, EMid, EMrole, ORGID) => {
    const token = jwt.sign({ EMid, EMrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const isProduction = process.env.NODE_ENV === "production"

    res.cookie("EMtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    })

    return token
}

export const GenerateJwtTokenAndSetCookiesHR = (res, HRid, HRrole, ORGID) => {
    const token = jwt.sign({ HRid, HRrole, ORGID }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const isProduction = process.env.NODE_ENV === "production"

    res.cookie("HRtoken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    })

    return token
}
