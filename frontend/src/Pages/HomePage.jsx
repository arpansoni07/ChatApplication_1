import React, { useContext } from "react";
import SideBar from "../Components/SideBar";
import ChatContainer from "../Components/ChatContainer";
import RightSideBar from "../Components/RightSideBar";
import { ChatContext } from "../../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full min-h-screen px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-[15%] sm:py-[5%] bg-[url('/bgImage.svg')] bg-cover bg-center">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden w-full min-h-[calc(100vh-4.5rem)]
         grid grid-cols-1 relative
       ${
         selectedUser
           ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
           : "md:grid-cols-2"
       }`}
      >
        <SideBar />
        <ChatContainer />
        <RightSideBar />
      </div>
    </div>
  );
};

export default HomePage;

// h-screen px-4 py-4 sm:px-[15%] sm:py-[5%]
