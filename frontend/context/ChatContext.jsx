import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

const USERS_POLL_INTERVAL = 10000;
const MESSAGES_POLL_INTERVAL = 2500;

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState({});

  const { axios, setOnlineUsers } = useContext(AuthContext);

  const usersPollRef = useRef(null);
  const messagesPollRef = useRef(null);

  const getUsers = async (options = { silent: false }) => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
        setOnlineUsers(data.onlineUserIds || []);
        if (selectedUser?._id) {
          const latestSelected = (data.users || []).find(
            (u) =>
              (u._id?.toString ? u._id.toString() : u._id) ===
              (selectedUser._id?.toString
                ? selectedUser._id.toString()
                : selectedUser._id)
          );
          if (latestSelected) {
            setSelectedUser((prev) =>
              prev && (prev._id?.toString ? prev._id.toString() : prev._id) ===
                (latestSelected._id?.toString
                  ? latestSelected._id.toString()
                  : latestSelected._id)
                ? { ...prev, ...latestSelected }
                : prev
            );
          }
        }
      }
    } catch (error) {
      if (!options.silent) toast.error(error.message);
    }
  };

  const getMessages = async (userId, options = { silent: false }) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages || []);
        if (data.typing) {
          setTypingStatus((prev) => ({
            ...prev,
            [userId]: Boolean(data.typing.isTyping),
          }));
        }
      }
    } catch (error) {
      if (!options.silent) toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        setTypingStatus((prev) => ({
          ...prev,
          [selectedUser._id]: false,
        }));
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const notifyTyping = async (userId, isTyping) => {
    try {
      await axios.post(`/api/messages/typing/${userId}`, { isTyping });
    } catch (error) {
      // avoid toast spam; log silently
      console.error("Typing status update failed:", error.message);
    }
  };

  useEffect(() => {
    getUsers();
    if (usersPollRef.current) clearInterval(usersPollRef.current);
    usersPollRef.current = setInterval(() => getUsers({ silent: true }), USERS_POLL_INTERVAL);

    return () => {
      if (usersPollRef.current) clearInterval(usersPollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser?._id) {
      if (messagesPollRef.current) clearInterval(messagesPollRef.current);
      setMessages([]);
      return;
    }

    getMessages(selectedUser._id);
    if (messagesPollRef.current) clearInterval(messagesPollRef.current);
    messagesPollRef.current = setInterval(
      () => getMessages(selectedUser._id, { silent: true }),
      MESSAGES_POLL_INTERVAL
    );

    return () => {
      if (messagesPollRef.current) clearInterval(messagesPollRef.current);
    };
  }, [selectedUser?._id]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    typingStatus,
    notifyTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
