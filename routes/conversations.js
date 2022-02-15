const router = require('express').Router();
const Conversation = require('../models/Conversation');

// new conversation
router.post("/", async (req, res) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    })

    try {
        const saveConversation = await newConversation.save();
        res.status(200).json(saveConversation);
    } catch (err) {
        res.status(500).json(err);
    }
})

//get conversation of a user
router.get('/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.find({ 
            members: { $in: [ req.params.userId ] }
        })
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
})

// find conversation including two userIds
router.get('/find/:firstUserId/:secondUserId', async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [ req.params.firstUserId, req.params.secondUserId ] }
        })

        // if exist return it
        if(conversation) {
            return res.status(200).json(conversation);
        }

        // else create one
        const newConversation = new Conversation({
            members: [req.params.firstUserId, req.params.secondUserId]
        })
        const saveConversation = await newConversation.save();
        res.status(200).json(saveConversation);

    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;