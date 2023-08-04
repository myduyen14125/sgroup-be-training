const express = require('express');
const poll_router = express.Router();
const knex = require("../database/knex");


// create poll
poll_router.post("/", (req, res) => {
    const { name, question, options } = req.body;
    knex('poll').insert({
        name: name,
        question: question
    }).returning('id')
        .then((pollIds) => {
            // Thêm các tùy chọn cho poll
            const pollId = pollIds[0];
            const optionsToInsert = options.map((option) => {
                return {
                    pollID: pollId,
                    title: option
                };
            });
            return knex('polloption').insert(optionsToInsert);
        }).then(() => {
            res.status(200).json({ message: 'Poll added' });
        }).catch((err) => {
            console.log(err);
            res.status(404).json({ message: 'failed to add poll' });
        });
});
// Get
poll_router.get('/:id', (req, res) => {
    const pollId = parseInt(req.params.id);
    knex('poll')
        .select()
        .where('pollID', pollId)
        .then((rows) => {
            if (rows.length === 0) {
                res.status(404).json({ message: 'poll not found' });
            } else {
                const poll = rows[0];
                knex('polloption')
                    .select()
                    .where('pollid', pollId)
                    .then((options) => {
                        const pollDetails = [poll, options.map((option) => {
                            return {
                                pollID: pollId,
                                title: option.title
                            }
                        })];
                        res.status(200).json(pollDetails);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ message: 'Failed to get poll options' });
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to get poll' });
        });
});

//Delete poll
poll_router.delete('/:id', (req, res) => {
    const pollId = parseInt(req.params.id);

    knex('poll')
        .where('pollID', pollId)
        .delete()
        .then((result) => {
            if (result === 0) {
                res.status(404).json({ message: 'poll not found' });
            } else {
                res.status(200).json({ message: 'poll deleted successfully' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to delete poll' });
        });
});
//Update poll
poll_router.put('/:id', (req, res) => {
    const pollId = parseInt(req.params.id);
    const { name, question } = req.body;

    knex('poll')
        .where('pollID', pollId)
        .update({ name, question })
        .then((result) => {
            if (result === 0) {
                res.status(404).json({ message: 'poll not found' });
            } else {
                res.status(200).json({ message: 'poll updated successfully' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to update poll ERR:' + err });
        });
});
//add option
poll_router.post('/:id/addOption', (req, res) => {
    const pollId = parseInt(req.params.id);
    const { title } = req.body;

    knex('polloption')
        .insert({ pollId, title })
        .then(() => {
            res.status(200).json({ message: 'option added successfully' });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to add option' });
        });
});
//delete option
poll_router.delete('/:id/deleteOption', (req, res) => {
    const pollId = parseInt(req.params.id);
    const { title } = req.body;

    knex('polloption').del()
        .where('pollID', pollId)
        .andWhere('title', title)
        .then((result) => {
            if (result === 0) {
                res.status(404).json({ message: 'option not found' });
            } else {
                res.status(200).json({ message: 'option deleted successfully' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to delete option' });
        });
});
//update option
poll_router.put('/:id/updateOption', (req, res) => {
    const pollId = parseInt(req.params.id);
    const { oldTitle, newTitle } = req.body;

    knex('polloption')
        .where('pollID', pollId)
        .andWhere('title', oldTitle)
        .update({ title: newTitle })
        .then((result) => {
            if (result === 0) {
                res.status(404).json({ message: 'option not found' });
            } else {
                res.status(200).json({ message: 'option updated successfully' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Failed to update option' });
        });
});

module.exports = poll_router;