class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async register(req, res) {
        try {
            const user = req.body;
            await this.userService.registerUser(user);
            res.status(200).json({ message: 'Register successfully' });
        } catch (error) {
            console.log(error.message);
            if (error.message === 'Username already exists') {
                res.status(400).json({ message: 'Username already exists' });
            } else {
                res.status(500).json({ message: 'Failed to register user' });
            }
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const token = await this.userService.loginUser(username, password);
            res.status(200).json({ message: 'Login successfully', token: token });
        } catch (error) {
            if (error.message === 'User not found' || error.message === 'Incorrect password') {
                res.status(400).json({ message: error.message });
            } else {
                console.log(error.message);
                res.status(500).json({ message: error.message });
            }
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const input = req.body;
            await this.userService.updateUser(id, input);
            return res.status(200).json({ message: 'User updated' });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ message: 'User not found' });
            } else {
                return res.status(500).json({ message: 'Failed to update user' });
            }
        }
    }
    // async forgotPassword(req, res) {
    //     const { mailService } =require('../../service/mail.service');
    //     const { mailFrom,mailTo, subject, text } = req.body;
    //     const mailOptions = {
    //         emailFrom: mailFrom,
    //         emailTo: mailTo,
    //         subject:subject,
    //         text:text
    //     };
    //     console.log(mailOptions);
    //     try {
    //         await mailService.sendEmail(mailOptions);
    //         res.send({ message: 'Email sent successfully' });
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ message: 'Failed to send email' });
    //     }
    // }
    async forgotPassword(req, res) {
        const { mailService } = require('../../service/mail.service');
        const { mailTo } = req.body;

        try {
            // Lấy thông tin user từ email
            const users = await this.userService.getEmail(mailTo);
            const user = users[0];
            //console.log(user);
            if (!user) {
                return res.status(400).json({ message: "Email not found" });
            }

            // Tạo và lưu thông tin về token và expiration token trong database
            const token = await this.userService.createRandomToken();
            console.log(token);
            
            const passwordResetExpiration = new Date(Date.now() + 10 * 60 * 1000);
            const data = {
                name: user.name,
                age: user.age,
                gender: user.gender,
                passwordResetToken: token,
                passwordResetExpiration: passwordResetExpiration,
            }
            this.userService.updateUser(user.id, data)
            // Gửi email
            const mailOptions = {
                emailFrom: "myduyen14125@gmail.com",
                emailTo: mailTo,
                subject: "Password reset requested",
                text: `Hi ${user.name}, You requested for a password reset. Here's your token: ${token}`,
            };
            try {
                await mailService.sendEmail(mailOptions);
                res.send({ message: 'Email sent successfully' });
            }
            catch (error) {
                console.log(error);
                res.status(500).send({ message: 'Failed to send email' });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async ResetPassword(req, res) {
        const { email, passwordResetToken, newPassword } = req.body;
        console.log(email);
        try {
            const user = await this.userService.FindUserToResetPass(email, passwordResetToken)
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            try {
                await this.userService.updatePass(email, newPassword)
                res.send({ message: 'Update password successfully' });
            }
            catch (error) {
                res.status(500).send({ message: 'Failed to update password' });
                console.log(error);
            }
            
        }
        catch (error) {
            console.log(error);
        }
    }
}
module.exports = UserController;