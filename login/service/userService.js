const secretKey = 'duySgroupSecret';
const jsonwebtoken = require('jsonwebtoken');
const { hashPass } = require('../../helper/hashing')
class UserService {
    constructor(db) {
        this.db = db;
    }
    async updatePass(email,password) {
        const { hashPassword, salt } = hashPass(password);
        const result = await this.db.promise().query(
            'update user set password = ?, salt = ?, passwordResetToken = null, passwordResetExpiration = null  where email = ?',
            [hashPassword, salt, email]
        );
    }
    async registerUser(user) {
        // Check if username already exists
        const rows = await this.db.promise().query(
            'SELECT * FROM user WHERE username=?',
            [user.username]
        );

        if (rows[0].length > 0) {
            throw new Error('Tên người dùng đã tồn tại');
        }

        // Hash password
        const { hashPassword, salt } = hashPass(user.password);

        // Insert user into the database
        const result = await this.db.promise().query(`
            INSERT INTO user(username, name, salt, password, age, email, gender) VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [
                user.username,
                user.name,
                salt,
                hashPassword,
                user.age,
                user.email,
                user.gender,
            ]
        );

        // Get the newly inserted user_id
        const userId = result[0].insertId;

        // Insert the user_id and role_id=1 into user_roles table
        await this.db.promise().query(`
            INSERT INTO user_roles(user_id, role_id) VALUES(?, 1)`,
            [userId]
        );

        if (result[0].affectedRows === 0) {
            throw new Error('Đăng kí người dùng thất bại');
        }
    }
    
    async loginUser(username, password) {
    // Kiểm tra xem người dùng có tồn tại không và lấy thông tin người dùng từ cơ sở dữ liệu
    const rows = await this.db.promise().query(
        'SELECT u.id, u.username, u.name, u.age, u.email, u.gender, u.Salt, u.password, r.id AS role FROM User u JOIN User_Roles ur ON u.id = ur.user_id JOIN Roles r ON ur.role_id = r.id WHERE u.username = ?',
        [username]
    );

    const row = rows[0];
    const user = row[0];

    if (!user) {
        throw new Error('User not found');
    }

    // Check if the password is correct
        const hashPassword = hashPass(password, user.Salt).hashPassword;
        //console.log(hashPassword);
        if (hashPassword !== user.password) {
            throw new Error('Incorrect password');
        }

    // Tạo và trả về token với vai trò (role)
    const token = jsonwebtoken.sign({
        id: user.id,
        username: user.username,
        password:user.password,
        name: user.name,
        age: user.age,
        email: user.email,
        gender: user.gender,
        role: user.role // Lấy vai trò từ kết quả truy vấn
    }, secretKey);

    return token;
    }
    
    async updateUser(userId, data) {
        const result = await this.db.promise().query(
            "UPDATE user SET name = ?, age = ?, gender = ? , passwordResetExpiration= ?, passwordResetToken= ? WHERE id = ?",
            [data.name, data.age, data.gender, data.passwordResetExpiration, data.passwordResetToken, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }
    }
    async getEmail(email) {
        const rows = await this.db.promise().query(
            'select * from user where email=?', [email]
        );
        const user = rows[0];
        //console.log(user);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async createRandomToken() {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return token;
    }
    async FindUserToResetPass(email, passwordResetToken) {
        const result = await this.db.promise().query(
            'SELECT * FROM user WHERE email = ? AND passwordResetToken = ?  ',
            [email, passwordResetToken, new Date(Date.now())]
        );
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }
        const users = result[0];
        const user = users[0];
        return user
    }
}
//comment
module.exports = UserService;