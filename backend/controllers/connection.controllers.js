import User from "../models/user.model.js";

// Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const senderId = req.userId;

        if (targetUserId === senderId.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const [sender, target] = await Promise.all([
            User.findById(senderId),
            User.findById(targetUserId)
        ]);

        if (!target) {
            return res.status(404).json({ message: "Target student not found" });
        }

        // Check if blocked
        if (target.blockedUsers.includes(senderId) || sender.blockedUsers.includes(targetUserId)) {
            return res.status(403).json({ message: "Unable to connect with this user" });
        }

        // Check if already connected
        const isConnected = sender.connections.some(id => id.toString() === targetUserId.toString());
        if (isConnected) {
            return res.status(400).json({ message: "Already connected with this student" });
        }

        // Check if request already pending
        const alreadyReceived = target.connectionRequests.some(
            r => r.from.toString() === senderId.toString() && r.status === "pending"
        );
        if (alreadyReceived) {
            return res.status(400).json({ message: "Connection request already pending" });
        }

        // Prevent bypassing rejected requests
        const wasRejected = target.connectionRequests.some(
            r => r.from.toString() === senderId.toString() && r.status === "rejected"
        ) || sender.sentRequests.some(
            r => r.to.toString() === targetUserId.toString() && r.status === "rejected"
        );
        if (wasRejected) {
            return res.status(403).json({
                message: "Your previous connection request was declined by this student. You cannot bypass this rule."
            });
        }

        // If target already sent a request to sender, auto-accept it!
        const existingReverseRequest = sender.connectionRequests.find(
            r => r.from.toString() === targetUserId.toString() && r.status === "pending"
        );

        if (existingReverseRequest) {
            sender.connections.push(targetUserId);
            target.connections.push(senderId);

            sender.connectionRequests = sender.connectionRequests.filter(
                r => r.from.toString() !== targetUserId.toString()
            );
            target.sentRequests = target.sentRequests.filter(
                r => r.to.toString() !== senderId.toString()
            );

            await Promise.all([sender.save(), target.save()]);
            return res.status(200).json({ message: "Mutual request! You are now connected", status: "connected" });
        }

        // Normal send request
        target.connectionRequests.push({
            from: senderId,
            status: "pending",
            createdAt: new Date()
        });

        sender.sentRequests.push({
            to: targetUserId,
            status: "pending",
            createdAt: new Date()
        });

        await Promise.all([sender.save(), target.save()]);

        return res.status(200).json({ message: "Connection request sent successfully", status: "pending" });
    } catch (error) {
        return res.status(500).json({ message: `sendConnectionRequest error: ${error.message}` });
    }
};

// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        const [currentUser, requestingUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId)
        ]);

        if (!requestingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add to connections
        if (!currentUser.connections.some(id => id.toString() === targetUserId.toString())) {
            currentUser.connections.push(targetUserId);
        }
        if (!requestingUser.connections.some(id => id.toString() === currentUserId.toString())) {
            requestingUser.connections.push(currentUserId);
        }

        // Remove from received requests on currentUser
        currentUser.connectionRequests = currentUser.connectionRequests.filter(
            r => r.from.toString() !== targetUserId.toString()
        );

        // Remove from sent requests on requestingUser
        requestingUser.sentRequests = requestingUser.sentRequests.filter(
            r => r.to.toString() !== currentUserId.toString()
        );

        await Promise.all([currentUser.save(), requestingUser.save()]);

        const updatedUser = await User.findById(currentUserId)
            .select("-password")
            .populate("connections", "name userName profileImage college degree verificationStatus year")
            .populate("connectionRequests.from", "name userName profileImage college degree verificationStatus year")
            .populate("sentRequests.to", "name userName profileImage college degree verificationStatus year");

        return res.status(200).json({
            message: "Connection request accepted!",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: `acceptConnectionRequest error: ${error.message}` });
    }
};

// Reject Connection Request
export const rejectConnectionRequest = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        const [currentUser, requestingUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId)
        ]);

        if (currentUser) {
            const reqItem = currentUser.connectionRequests.find(
                r => r.from.toString() === targetUserId.toString()
            );
            if (reqItem) {
                reqItem.status = "rejected";
            }
            await currentUser.save();
        }

        if (requestingUser) {
            const sentItem = requestingUser.sentRequests.find(
                r => r.to.toString() === currentUserId.toString()
            );
            if (sentItem) {
                sentItem.status = "rejected";
            }
            await requestingUser.save();
        }

        return res.status(200).json({ message: "Connection request rejected" });
    } catch (error) {
        return res.status(500).json({ message: `rejectConnectionRequest error: ${error.message}` });
    }
};

// Remove Connection
export const removeConnection = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId)
        ]);

        if (currentUser) {
            currentUser.connections = currentUser.connections.filter(
                id => id.toString() !== targetUserId.toString()
            );
            await currentUser.save();
        }

        if (targetUser) {
            targetUser.connections = targetUser.connections.filter(
                id => id.toString() !== currentUserId.toString()
            );
            await targetUser.save();
        }

        return res.status(200).json({ message: "Connection removed" });
    } catch (error) {
        return res.status(500).json({ message: `removeConnection error: ${error.message}` });
    }
};

// Get All Connection Data (connections, incoming requests, sent requests)
export const getAllConnections = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("connections connectionRequests sentRequests")
            .populate("connections", "name userName profileImage college degree verificationStatus year bio skills")
            .populate("connectionRequests.from", "name userName profileImage college degree verificationStatus year bio skills")
            .populate("sentRequests.to", "name userName profileImage college degree verificationStatus year bio skills");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            connections: user.connections || [],
            incomingRequests: user.connectionRequests?.filter(r => r.status === "pending") || [],
            sentRequests: user.sentRequests || []
        });
    } catch (error) {
        return res.status(500).json({ message: `getAllConnections error: ${error.message}` });
    }
};
