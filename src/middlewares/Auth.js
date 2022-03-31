const User = require('../models/User');

module.exports = {

    private: async(req, res, next) => {
        const token = req.query.token || req.body.token;
        if (token) {
            const user = await User.findOne({ token });
            if (user) return next();
        }

        res.json({ notallowed: true });
    }

};