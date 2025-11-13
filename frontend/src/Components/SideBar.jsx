import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";
import Avatar from "./Avatar";

const SideBar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout } = useContext(AuthContext);

  const [input, setInput] = useState();

  const navigate = useNavigate(false);

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] flex flex-col relative">
      <div
        className={`bg-[#8185B2/10] flex flex-col h-full rounded-r-xl overflow-hidden text-white ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        {/* Header Section */}
        <div className="flex-shrink-0 p-5 pb-3">
          <div className="flex justify-between items-center">
            <img src={assets.logo} alt="logo" className="max-w-40"></img>
            <div className="relative py-2 group ">
              <img
                src={assets.menu_icon}
                alt="menu"
                className="max-h-5 cursor-pointer"
              ></img>
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
                <p
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer text-sm"
                >
                  Edit profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p onClick={() => logout()} className="cursor-pointer text-sm">
                  Logout
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#282142] relative w-full mt-4 flex items-center gap-2 py-1 px-2 rounded-full">
            <img
              src={assets.search_icon}
              alt="search_icon"
              className="w-4 absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none"
            />
            <input
              onChange={(e) => setInput(e.target.value)}
              type="text"
              className="bg-[#282142] w-full pl-10 pr-4 py-2 rounded-full text-white text-xs placeholder:text-[#c8c8c8] border-none outline-none"
              placeholder="search user..."
            />
          </div>
        </div>

        {/* User List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="flex flex-col space-y-1">
            {filteredUsers.map((user, index) => (
              <div
                key={user._id || index}
                onClick={() => {
                  setSelectedUser(user);
                  setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                }}
                className={`relative flex items-center gap-2 p-2 pl-4 rounded-cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition-colors
                ${selectedUser?._id === user._id && "bg-[#282142]/50"}`}
              >
                <Avatar
                  src={user?.profilePic}
                  name={user?.fullName}
                  size="md"
                  className="flex-shrink-0"
                />
                <div className="flex flex-col leading-5 flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.fullName}
                  </p>

                  {user?.isOnline ? (
                    <span className="text-green-400 text-xs">Online</span>
                  ) : (
                    <span className="text-neutral-400 text-xs">Offline</span>
                  )}
                </div>
                {unseenMessages[user._id] > 0 && (
                  <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                    {unseenMessages[user._id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
