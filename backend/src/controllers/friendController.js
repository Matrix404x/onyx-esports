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

        // Check if they sent YOU a request (if so, maybe auto-accept? or just allow sending back to create match? standard is blocked usually or specific logic. For now simpler: push request)
        // Actually, if they sent you a request, you should accept it instead. But let's keep it simple: push request.

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

        // Remove the request from the array (or keep as log? usually remove or filter)
        // Let's keep it but marked accepted, or remove. Usually better to remove to keep doc size small.
        // The detailed plan said "status enum", so maybe we keep it. But for friends list, we use `friends` array.
        // To clean up, let's remove the request from the array after acceptance to save space, relies on `friends` array for truth.
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
