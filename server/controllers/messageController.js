import Message from "../middleWare/models/Message.js";
import user from "../middleWare/models/User.js";
import cloudinary, { isCloudinaryConfigured } from "../lib/cloudinary.js";
import { userSocketMap } from "../lib/socket.js";

const ONLINE_THRESHOLD_MS = 15 * 1000; // 15 seconds
const TYPING_TIMEOUT_MS = 5000; // 5 seconds
// Get all user except the logged in user

// export const getUsersForSidebar = async () => {
//   try {
//     const userId = req.user._id;
//     const filteredUsers = await user
//       .find({ _id: { $ne: userId } })
//       .select("-password");

//     // Count number of unseen messages
//     const unseenMessages = {};
//     const promises = filteredUsers.map(async () => {
//       const messages = await Message.find({
//         senderId: user._id,
//         receiverId: userId,
//         seen: false,
//       });

//       if (messages.length > 0) {
//         unseenMessages[user._id] = messages.length;
//       }
//     });
//     await Promise.all(promises);
//     res.json({ success: true, users: filteredUsers, unseenMessages });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User ID:", userId?.toString ? userId.toString() : userId);

    const filteredUsers = await user
      .find({ _id: { $ne: userId } })
      .select("-password");

    const now = Date.now();
    const usersWithPresence = filteredUsers.map((u) => {
      const plain = u.toObject();
      const lastSeenTime = plain.lastSeen ? new Date(plain.lastSeen).getTime() : 0;
      const isOnline =
        lastSeenTime && now - lastSeenTime <= ONLINE_THRESHOLD_MS ? true : false;
      return { ...plain, isOnline };
    });

    const onlineUserIds = usersWithPresence
      .filter((u) => u.isOnline)
      .map((u) => u._id);

    const unseenMessages = {};
    const promises = filteredUsers.map(async (u) => {
      const messages = await Message.find({
        senderId: u._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[u._id] = messages.length;
      }
    });

    await Promise.all(promises);
    res.json({
      success: true,
      users: usersWithPresence,
      unseenMessages,
      onlineUserIds,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    const typingUser = await user
      .findById(selectedUserId)
      .select("typingTo typingUpdatedAt lastSeen");

    let typing = { isTyping: false };
    if (
      typingUser?.typingTo?.toString() === myId.toString() &&
      typingUser?.typingUpdatedAt &&
      Date.now() - new Date(typingUser.typingUpdatedAt).getTime() <=
        TYPING_TIMEOUT_MS
    ) {
      typing = { isTyping: true, lastUpdated: typingUser.typingUpdatedAt };
    }

    res.json({ success: true, messages, typing });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
// api to mark message as seen using id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// send a message to selected user

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      if (!isCloudinaryConfigured) {
        throw new Error(
          "Cloudinary credentials are missing. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        );
      }

      // Upload with aggressive compression and optimization settings
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-app",
        resource_type: "image",
        transformation: [
          {
            width: 800,
            height: 800,
            crop: "limit",
            quality: "auto:low",
          },
        ],
        eager: [
          {
            width: 400,
            height: 400,
            crop: "limit",
            quality: "auto:low",
          },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    //Emit the new message to the receiver's socket
    const receiverIdStr = receiverId?.toString
      ? receiverId.toString()
      : receiverId;
    const receiverSocketId = userSocketMap[receiverIdStr];
    if (receiverSocketId) {
      // Get io instance from global
      const { io } = await import("../server.js");
      if (io?.to) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }
    await user.findByIdAndUpdate(senderId, {
      typingTo: null,
      typingUpdatedAt: null,
      lastSeen: new Date(),
    });

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const updateTypingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isTyping } = req.body;

    const update = isTyping
      ? { typingTo: id, typingUpdatedAt: new Date(), lastSeen: new Date() }
      : { typingTo: null, typingUpdatedAt: null, lastSeen: new Date() };

    await user.findByIdAndUpdate(req.user._id, update);

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
