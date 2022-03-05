
const { validationResult } = require("express-validator");

const handleValidation = () => {
    return (req, res, next) => {
        const validationRes = validationResult(req);
        if (validationRes.isEmpty()) {
            next()
        } else {
            res.status(400).json({ message: "validation error our custom validation", errors:validationRes });
        }

    }
}

module.exports = handleValidation;