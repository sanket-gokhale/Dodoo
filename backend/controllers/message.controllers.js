import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Get Chat Messages between Current User and Target User (Locked to connected users only)
export const getMessages = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId).select("name userName profileImage college degree verificationStatus year")
        ]);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Connection Guard: Messaging unlocked ONLY between connected users
        const isConnected = currentUser.connections.some(id => id.toString() === targetUserId.toString());

        if (!isConnected) {
            return res.status(403).json({
                message: "Private messaging is locked. You must be connected with this student to send or view messages.",
                isConnected: false,
                targetUser
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            isConnected: true,
            targetUser,
            messages
        });
    } catch (error) {
        return res.status(500).json({ message: `getMessages error: ${error.message}` });
    }
};

// Send Private Message (Locked to connected users only)
export const sendMessage = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const { text } = req.body;
        const currentUserId = req.userId;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text cannot be empty" });
        }

        const currentUser = await User.findById(currentUserId);
        const isConnected = currentUser.connections.some(id => id.toString() === targetUserId.toString());

        if (!isConnected) {
            return res.status(403).json({
                message: "Private messaging is locked. Connection must be accepted first.",
                isConnected: false
            });
        }

        const newMessage = await Message.create({
            sender: currentUserId,
            receiver: targetUserId,
            text: text.trim()
        });

        return res.status(201).json(newMessage);
    } catch (error) {
        return res.status(500).json({ message: `sendMessage error: ${error.message}` });
    }
};

// Get Conversation List (All connected users with their latest message preview)
export const getConversations = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const user = await User.findById(currentUserId).populate(
            "connections",
            "name userName profileImage college degree verificationStatus year"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = user.connections || [];

        // For each connection, fetch the most recent message
        const conversations = await Promise.all(
            connections.map(async (contact) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { sender: currentUserId, receiver: contact._id },
                        { sender: contact._id, receiver: currentUserId }
                    ]
                }).sort({ createdAt: -1 });

                return {
                    contact,
                    lastMessage: lastMessage ? lastMessage.text : "Connected! Say hello 👋",
                    lastMessageTime: lastMessage ? lastMessage.createdAt : contact.createdAt,
                    unread: lastMessage ? (!lastMessage.read && lastMessage.receiver.toString() === currentUserId.toString()) : false
                };
            })
        );

        // Sort by most recent message
        conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: `getConversations error: ${error.message}` });
    }
};
