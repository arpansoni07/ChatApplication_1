import React, { useContext } from "react";
import SideBar from "../Components/SideBar";
import ChatContainer from "../Components/ChatContainer";
import RightSideBar from "../Components/RightSideBar";
import { ChatContext } from "../../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="min-h-screen w-full bg-[url('/bgImage.svg')] bg-cover bg-center">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-[8%] lg:px-[10%]">
        <div
          className={`flex-1 backdrop-blur-xl border-2 border-gray-600 rounded-3xl overflow-hidden grid grid-cols-1 relative min-h-0
       ${
         selectedUser
           ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
           : "md:grid-cols-2"
       }`}
          style={{
            minHeight:
              "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.75rem)",
          }}
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
