import React from "react";
import User from './components/User.jsx';
import Agent from './components/Agent.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/footer.jsx";

function App() {

  return (
    <>
    <div className="min-h-screen flex flex-col">
      <Navbar /> {/* Navbar remains unaffected */}

      {/* Apply the background only to the main content */}
      <div className="flex-grow bg-violet-400">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user" element={<User />} />
            <Route path="/agent" element={<Agent />} />
          </Routes>
        </BrowserRouter>
      </div>

      <Footer /> {/* Footer remains unaffected */}
    </div>
    </>
  )
}

export default App;
