export const RoleAuthorization = (...AuthRoles) => {
    return (req, res, next) => {
        if (!AuthRoles.includes(req.Role)) {
            return res.status(403).json({ success : false, message: "You are not athourized to access this route" });
        }
        next();
    } 
}