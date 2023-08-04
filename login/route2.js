const express = require('express');
const validateUser = require('../midleware/checkUser').validateUser;
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const db = require("../database/connection");
const { hashPass } = require('../helper/hashing')
const router = express.Router()
router.post('/register', validateUser, (req, res) => {
    const {
        username,
        password,
        name,
        age,
        email, gender
    } = req.body
    db.query(
        'select * from user where username=?', username,
        (err, rows) => {
            if (err) {
                return res.status(400).json({
                    message: "loi"
                });
            }
            // check if username is already exist
            const user = rows[0]
            if (user) {
                return res.status(400).json({
                    message: "user is already exist"
                });
            }
            // hash password
            const {
                hashPassword,
                salt,
            } = hashPass(password)
            //console.log(salt)
            // insert user into database
            db.query(
                `insert into user(username,name,salt,password,age,email,gender)
                value(?,?,?,?,?,?,?)`
                , [
                    username,
                    name,
                    salt,
                    hashPassword,
                    age,
                    email,
                    gender

                ],
                (err, rows) => {
                    if (err)
                        return res.status(500).json({
                            message: 'loi 2'
                        })
                    return res.status(200).json({
                        message: "register successfully"
                    })
                }
            )
        }
    )
})
const secretKey = 'duySgroupSecret';

router.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body
    db.query(
        'select * from user where username=?', [username],
        (err, rows) => {
            if (err) {
                return res.status(400).json({
                    message: "loi"
                });
            }
            // check if username is already exist
            const user = rows[0]
            //console.log(user)
            if (!user) {
                return res.status(400).json({
                    message: "user is not exist"
                });
            }
            // check password
            const hashPassword = hashPass(password, user.Salt).hashPassword
            //if password is not correct
            //console.log(hashPassword,user.Salt,"\n",user.password);
            if (hashPassword != user.password) {
                return res.status(400).json({
                    message: "password is not correct"
                });
            }
            // if password is correct
            // create token
            const token = jsonwebtoken.sign({
                id: user.id,
                username: user.username,
                name: user.name,
                age: user.age,
                email: user.email,
                gender: user.gender
            },
                secretKey,// secret key
            )

            return res.status(200).json({
                message: "login successfully",
                token: token

            })
        }
    )
})
// Update user info endpoint
router.put('/myuser/:id', validateUser, async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);

        // Verify JWT token from Authorization header
        const token = req.header('Authorization').replace('Bearer ', '');
        const decodedToken = jsonwebtoken.verify(token, secretKey);
        if (decodedToken.id !== userId) {
            throw new Error('User ID in JWT token does not match target user ID');
        }
        // Check input data
        const { name, age, gender } = req.body;
        // Update user info in database
        db.query("UPDATE user SET name = ?, age = ?, gender = ? WHERE id = ?", [name, age, gender, decodedToken.id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Failed to update user info' });
            } else if (result.affectedRows === 0) {
                res.status(404).json({ message: 'User not found' });
            } else {
                res.status(200).json({ message: 'User updated' });
            }
        });
    } catch (error) {
        if (error instanceof jsonwebtoken.JsonWebTokenError) {
            res.status(401).json({ message: 'Unauthorized' });
            console.log(error);
        } else {
            next(error);
        }
    }
});

module.exports = router;