const jwt = require('jsonwebtoken');
const models = require('../models/index');
const bcrypt = require('bcryptjs');

var authService = {
    signUser: function (user) {
        const token = jwt.sign(
            {
                Username: user.Username,
                UserId: user.UserId,
                Admin: user.Admin
            },
            'secretkey',
            {
                expiresIn: '1h'
            }
        );
        return token;
    },
    verifyUser: function (req, res, next) {
        try {
            let token = req.cookies.jwt;
            let decoded = jwt.verify(token, 'secretkey');
            models.users.findByPk(decoded.UserId)
                .then(user => {
                    console.log(user.UserId);
                    req.user = user;
                    next();
                });
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    hashPassword: function (plainTextPassword) {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(plainTextPassword, salt);
        return hash;
    },
    comparePasswords: function (plainTextPassword, hashedPassword) {
        return bcrypt.compareSync(plainTextPassword, hashedPassword);
    }
}

module.exports = authService;