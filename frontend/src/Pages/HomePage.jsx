import React, { useContext } from "react";
import SideBar from "../Components/SideBar";
import ChatContainer from "../Components/ChatContainer";
import RightSideBar from "../Components/RightSideBar";
import { ChatContext } from "../../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="min-h-[100dvh] w-full bg-[url('/bgImage.svg')] bg-cover bg-center">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
        <div
          className={`flex-1 backdrop-blur-xl border-2 border-gray-600 rounded-3xl overflow-hidden grid grid-cols-1 relative
       ${
         selectedUser
           ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1.1fr]"
           : "md:grid-cols-[1fr_1fr]"
       }`}
        >
          <SideBar />
          <ChatContainer />
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// h-screen px-4 py-4 sm:px-[15%] sm:py-[5%]
