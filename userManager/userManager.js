const express = require('express');
const user_router = express.Router();
const validateUser = require('../midleware/checkUser').validateUser;
const checkAccess = require('../midleware/checkUser').checkAccess;
const knex = require("../database/knex");
const jsonwebtoken = require('jsonwebtoken');
const { hashPass } = require('../helper/hashing')
const env = require('dotenv');
env.config();


// Lấy danh sách user
user_router.get('/',checkAccess("View user"), (req, res) => {
    let pageNumber = req.query.page;
    const PAGE_SIZE = req.query.paging || 10;
    if (pageNumber) {
        // pagination
        pageNumber = parseInt(pageNumber);
        if (pageNumber > 0) {
            const skip = pageNumber * PAGE_SIZE
            knex.select('*').from('user').limit(PAGE_SIZE).offset(skip)
                .then((result) => {
                    res.send(result);
                }).catch((err) => {
                    throw err;
                });
        }
        else {
            res.status(400).send("Số trang không hợp lệ");
        }
    }
    else {
        //get all
        knex.select('*').from('user')
            .then((result) => {
                res.send(result);
            }).catch((err) => {
                throw err;
            });
    }
});

// Lấy chi tiết user
user_router.get('/id/:id',checkAccess("View user"), (req, res) => {
    const id = parseInt(req.params.id);
    knex.select('*').from('user').where('id', id).then((result) => {
        res.send(result);
    }).catch((err) => {
        throw err;
    });
});

// Thêm user mới
user_router.post('/', validateUser, checkAccess("Add user"), async (req, res) => {
    const author = req.headers.authorization.substring(7);
    const id = jsonwebtoken.verify(author, process.env.secretKey).id;
    //const role = jsonwebtoken.verify(author, process.env.secretKey).role;
    const { name, age, gender, password, email, username, userRole } = req.body;
    const { hashPassword, salt } = hashPass(password);
            const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            try {
                const insertedUserIds = await knex('user').insert({
                    name: name,
                    age: age,
                    gender: gender,
                    password: hashPassword,
                    salt: salt,
                    email: email,
                    username: username,
                    CreatedAt: createdAt,
                    createdby: id
                });

                const userId = insertedUserIds[0]; // Lấy ID của người dùng đã được chèn

                // Thêm vai trò của người dùng vào bảng user_role
                await knex('user_roles').insert({
                    user_id: userId,
                    role_id: userRole
                });

                res.status(200).json({ message: 'User added' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to add user' });
            }
        } 
);


// Cập nhật thông tin user
user_router.put('/:id', validateUser, checkAccess("Edit user"), async (req, res) => {
    const id = parseInt(req.params.id);
    // Kiểm tra quyền truy cập
        const updatedUser = {
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender,
            email: req.body.email,
            username: req.body.username,
            CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        try {
            await knex('user').where('id', id).update(updatedUser);
            // Thay đổi vai trò của người dùng trong bảng user_role
            if (req.body.role) {
                const newRoleId = req.body.role; // ID của vai trò mới
                
                    // Vai trò mới tồn tại, cập nhật vai trò của người dùng trong bảng user_role
                await knex('user_role')
                        .where('user_id', id)
                        .update({ role_id: newRoleId });

                res.status(200).json({ message: 'User updated' });
                } 
            else {
                res.status(200).json({ message: 'User updated' });
            }
        } catch (error) {
            console.error(error);
            res.status(404).json({ message: 'User not found' });
        }
    });


// Xóa user
user_router.delete('/:id', checkAccess("Delete user"),async (req, res) => {
    const id = parseInt(req.params.id);
        knex('user').where('id', id).del().then(() => {
            res.status(200).json({ message: 'User deleted' });
        }).catch((err) => {
            console.log(err);
            res.status(404).json({ message: 'User not found' });
        });
    });

// Exports cho biến user_router
module.exports = user_router;
