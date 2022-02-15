const router = require('express').Router();
const User = require('../models/User');

// get user
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId  
            ? await User.findById(userId)
            : await User.findOne({ username: username })
        const { password, updatedAt, ...other } = user._doc
        res.status(200).json(other)
    } catch(err) {
        res.status(500).json(err)
    }
})

// get all users
router.get('/all', async (req, res) => {
    try {
        const users = await User.find();
        users.map(user => ({
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture
        }))
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
})

// get friends
router.get('/friends/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const friends = await Promise.all(
            user.following.map(friendId => {
                return User.findById(friendId)
            })
        )
        friends.map(friend => ({ 
            _id: friend._id,
            username: friend.username,
            profilePicture: friend.profilePicture
        }));
        res.status(200).json(friends);
    } catch (err) {
        res.status(500).json(err)
    }
})

// update user
router.put('/:id', async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account has been deleted!")
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json('You can update only your account!')
    }
})

// delete user
router.delete('/:id', async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json('User is deleted!');
    } else {
        return res.status(403).json('You can delete only your account!')  
    }
})

// follow user
router.put('/:id/follow', async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json("User has been followed.");
            } else {
                res.status(403).json("You are already following this user.")
            }
        } catch (err) {
            res.status(500).json(err)
        }

    } else {
        res.status(403).json("You cant follow yourself.")
    }
})

// unfollow user
router.put('/:id/unfollow', async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json("User has been unfollowed.");
            } else {
                res.status(403).json("You were not following this user.")
            }
        } catch (err) {
            res.status(500).json(err)
        }

    } else {
        res.status(403).json("You cant unfollow yourself.")
    }
})

module.exports = router;