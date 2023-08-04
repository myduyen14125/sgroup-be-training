const crypto = require('crypto')

function hashPass(plainPass, salt) {
    if(!salt)
    { salt = crypto.randomBytes(16).toString('hex'); }
    const hashPassword = crypto.pbkdf2Sync(
        plainPass,
        salt,
        1000,
        64,
        'sha1',
    ).toString('hex');
    return {
        salt,
        hashPassword,
    };
}
module.exports = { hashPass }