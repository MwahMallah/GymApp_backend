const messageRouter = require('express').Router();
const Message = require('../models/message');
const User = require("../models/user");

messageRouter.get("/:roomName", async (req, res) => {
    const roomName = req.params.roomName;
    const [user1, user2] = roomName.split('-').sort(); // Extract and sort users

    try {
        // Fetch messages where "from" and "to" match either order
        const messages = await Message.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


//gets unseen messages for user
messageRouter.get("/unseen/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        console.log(userId);
        
        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find unseen messages where `to` matches the user's username
        const unseenMessages = await Message.find({ 
            to: user.username, // or to: userId if you store `to` as userId
            seen: false 
        });

        res.status(200).json(unseenMessages);
    } catch (error) {
        console.error('Error fetching unseen messages:', error);
        res.status(500).json({ error: 'Failed to fetch unseen messages' });
    }
});

messageRouter.put('/unseen/:msgId', async (req, res) => {
    const msgId = req.params.msgId;

    try {
        const message = await Message.findByIdAndUpdate(
            msgId, 
            { seen: true }, 
            { new: true }   
        );
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Failed to mark message as seen' });
    }
});

module.exports = messageRouter;