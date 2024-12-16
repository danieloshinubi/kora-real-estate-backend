"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.roles) {
            res.sendStatus(401); // Unauthorized
            return;
        }
        const rolesArray = [...allowedRoles];
        const hasRole = req.roles.some((role) => rolesArray.includes(role)); // Check if any role matches
        if (!hasRole) {
            res.sendStatus(401); // Unauthorized
            return;
        }
        next(); // Proceed to the next middleware or route handler
    };
};
exports.default = verifyRoles;
