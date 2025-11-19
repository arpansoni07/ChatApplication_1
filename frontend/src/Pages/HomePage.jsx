import React, { useContext } from "react";
import SideBar from "../Components/SideBar";
import ChatContainer from "../Components/ChatContainer";
import RightSideBar from "../Components/RightSideBar";
import { ChatContext } from "../../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="min-h-[100dvh] w-full bg-[url('/bgImage.svg')] bg-cover bg-center">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
        <div
          className={`flex-1 backdrop-blur-xl border-2 border-gray-600 rounded-3xl overflow-hidden grid grid-cols-1 relative min-h-0 h-full
       ${
         selectedUser
           ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
           : "md:grid-cols-2"
       }`}
          style={{
            maxHeight:
              "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem)",
            minHeight:
              "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 3rem)",
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
