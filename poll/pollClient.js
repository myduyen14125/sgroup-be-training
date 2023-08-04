const express = require('express');
const pollClient = express.Router();
const knex = require("../database/knex");
const jsonwebtoken = require('jsonwebtoken');
const date = new Date();
const env = require('dotenv');
env.config();

// Api submit option
pollClient.post('/submit/:id', (req, res) => {
    const optionId = parseInt(req.params.id);
    const user = req.headers.authorization;
    const userId = jsonwebtoken.verify(user, process.env.secretKey).id;
    knex('user_option').insert({
        userID: userId,
        optionID: optionId,
        dateSelected: date.toISOString().slice(0, 19).replace('T', ' ')
    }).then(() => {
        res.status(200).json({ message: 'Voted' });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Failed to vote' });
    });
})
// Api unsubmit option
pollClient.delete('/unsubmit/:id', (req, res) => {
    const optionId = parseInt(req.params.id);
    knex('user_option')
        .where('optionID' , optionId)
        .del()
        .then((result) => {
            if (result === 0) {
                res.status(404).json({ message: 'option not found' });
            } else {
                res.status(200).json({ message: 'option unsubmit successfully' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to unsubmit option' });
        });
    
})

module.exports = pollClient;