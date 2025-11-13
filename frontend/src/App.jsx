//

import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";

const App = () => {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-semibold">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
