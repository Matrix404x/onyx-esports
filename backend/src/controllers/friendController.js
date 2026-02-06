import User from '../models/User.js';

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to send request TO
        const senderId = req.user.id; // User sending the request

        if (userId === senderId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const recipient = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already friends
        if (recipient.friends.includes(senderId)) {
            return res.status(400).json({ message: "You are already friends" });
        }

        // Check if request already pending
        const existingRequest = recipient.friendRequests.find(
            req => req.sender.toString() === senderId && req.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }



        recipient.friendRequests.push({ sender: senderId, status: 'pending' });
        await recipient.save();

        res.json({ message: "Friend request sent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        const request = user.friendRequests.id(requestId);

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: "Request already handled" });
        }

        // Update status
        request.status = 'accepted';

        // Add to friends list for BOTH
        const senderId = request.sender;
        const sender = await User.findById(senderId);

        if (!user.friends.includes(senderId)) {
            user.friends.push(senderId);
        }

        if (sender && !sender.friends.includes(userId)) {
            sender.friends.push(userId);
            await sender.save();
        }


        request.deleteOne();

        await user.save();

        res.json({ message: "Friend request accepted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Reject Friend Request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const request = user.friendRequests.id(requestId);

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Just remove it
        request.deleteOne();
        await user.save();

        res.json({ message: "Friend request rejected" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Friend Requests
export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests.sender', 'username avatar tagLine');

        // Filter only pending
        const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');

        res.json(pendingRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Friends List
export const getFriendsList = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username avatar tagLine bio');
        res.json(user.friends);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Remove Friend
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove from both friends lists
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.json({ message: "Friend removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Block User
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to block
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const currentUser = await User.findById(currentUserId);
        const userToBlock = await User.findById(userId);

        if (!userToBlock) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add to blocked list if not already there
        if (!currentUser.blockedUsers.includes(userId)) {
            currentUser.blockedUsers.push(userId);
        }

        // Remove from friends list if present
        if (currentUser.friends.includes(userId)) {
            currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
            userToBlock.friends = userToBlock.friends.filter(id => id.toString() !== currentUserId);
            await userToBlock.save();
        }

        // Remove any pending friend requests from this user
        currentUser.friendRequests = currentUser.friendRequests.filter(req => req.sender.toString() !== userId);

        await currentUser.save();

        res.json({ message: "User blocked successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
