import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../Lib/utils";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    typingStatus,
    notifyTyping,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);
  const typingActiveRef = useRef(false);

  const [input, setInput] = useState("");
  const isPeerTyping = selectedUser?._id
    ? Boolean(typingStatus[selectedUser._id])
    : false;
  const selectedUserIdStr = selectedUser?._id?.toString
    ? selectedUser._id.toString()
    : selectedUser?._id;
  const isSelectedUserOnline = selectedUserIdStr
    ? onlineUsers.some(
        (onlineId) =>
          (onlineId?.toString ? onlineId.toString() : onlineId) ===
          selectedUserIdStr
      )
    : false;

  const stopTyping = () => {
    if (!selectedUser?._id) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      notifyTyping(selectedUser._id, false);
    }
  };

  const scheduleTypingStop = () => {
    if (!selectedUser?._id) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
      stopTyping();
    }, 1500);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!selectedUser?._id) return;
    if (value.trim() === "") {
      stopTyping();
      return;
    }

    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      notifyTyping(selectedUser._id, true);
    }
    scheduleTypingStop();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
    stopTyping();
  };
  // Compress image function - More aggressive compression
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.65) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions - always resize if larger than max
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          // Improve image quality during resize
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with higher compression
          const compressedImage = canvas.toDataURL("image/jpeg", quality);
          
          // Check if compressed size is reasonable (max 500KB)
          const base64Size = (compressedImage.length * 3) / 4;
          if (base64Size > 500 * 1024) {
            // Further compress if still too large
            const newQuality = Math.max(0.4, quality - 0.15);
            const furtherCompressed = canvas.toDataURL("image/jpeg", newQuality);
            resolve(furtherCompressed);
          } else {
            resolve(compressedImage);
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size should be less than 3MB");
      e.target.value = "";
      return;
    }

    try {
      toast.loading("Compressing image...", { id: "compress" });
      
      // Compress the image
      const compressedImage = await compressImage(file);
      
      toast.success("Image compressed successfully", { id: "compress" });
      
      // Send the compressed image
      await sendMessage({ image: compressedImage });
      e.target.value = "";
    } catch (error) {
      toast.error("Failed to process image", { id: "compress" });
      console.error("Image compression error:", error);
      e.target.value = "";
    }
    stopTyping();
  };

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      stopTyping();
      typingActiveRef.current = false;
    };
  }, [selectedUser?._id]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <Avatar
          src={selectedUser?.profilePic}
          name={selectedUser?.fullName}
          size="md"
          className="w-10 h-10"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {isSelectedUserOnline && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-20">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const msgSenderIdStr = msg.senderId?.toString
              ? msg.senderId.toString()
              : msg.senderId;
            const authUserIdStr = authUser?._id?.toString
              ? authUser._id.toString()
              : authUser?._id;
            const isMyMessage = msgSenderIdStr === authUserIdStr;
            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2 ${
                  isMyMessage ? "flex-row-reverse" : "justify-start"
                }`}
              >
                {msg.image ? (
                  <div className="max-w-[240px] md:max-w-[300px] mb-8">
                    <img
                      src={msg.image}
                      alt="Shared image"
                      className="w-full h-auto max-h-[300px] md:max-h-[350px] object-contain border border-gray-700/50 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                      isMyMessage ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <div className="text-center text-xs">
                  <Avatar
                    src={
                      isMyMessage
                        ? authUser?.profilePic
                        : selectedUser?.profilePic
                    }
                    name={
                      isMyMessage ? authUser?.fullName : selectedUser?.fullName
                    }
                    size="sm"
                  />
                  <p className="text-gray-500">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-gray-300 text-xs italic mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {(selectedUser?.fullName?.split(" ")[0] || "User") + " is typing..."}
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>
      {/* bottom area */}

      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3 bg-gray-900/95 border-t border-gray-700/50"
      >
        <div className="flex flex-1 items-center bg-gray-800/90 border border-gray-700/50 px-4 py-2 rounded-full hover:border-gray-600/70 transition-colors">
          <input
            onChange={handleInputChange}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="send a message"
            className="flex-1 text-sm p-2 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent focus:ring-0"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpg, image/jpeg, image/webp"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer hover:opacity-70 transition-opacity">
            <img
              src={assets.gallery_icon}
              alt="Attach image"
              className="w-5 h-5"
            />
          </label>
        </div>
        <button
          type="submit"
          onClick={handleSendMessage}
          className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <img
            src={assets.send_button}
            alt="Send message"
            className="w-7 h-7"
          />
        </button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 mx-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
