import axios from "axios";
import { useState, useEffect } from "react";

const BASE_URL = "{WEBSITE_URL}"; 

const User = () => {
    const [chatStarted, setChatStarted] = useState(false); 
  const [userMessages, setUserMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [Id, setId] = useState(() => {
    localStorage.setItem('counter', parseInt(1));
    const savedCounter = localStorage.getItem('counter');
    return savedCounter;
  });
  const [chatEndedMessage, setChatEndedMessage] = useState(null);

  // Handle tab change

  // Start a new chat (User)
  const startChat = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await axios.post(`${BASE_URL}/customer`, 
        {data :{id : Id, msg : inputText, language: "es",
        status: "new" }},
        );
        console.log(response);
      setUserMessages([{ sender: "User", text: inputText }]);
      setInputText("");
      setChatStarted(true);
    } catch (err) {
      setError("Failed to start chat. Please try again.", err);
    }
  };

  // Send a message (User)
  const sendUserMessage = async () => {
    if (!inputText.trim()) return;
    //response=>console.log(response.data)).catch(error=>console.error(error)
    try {
      await axios.post(`${BASE_URL}/customer/`, {data :{id : Id, msg : inputText, language: "es",
        status: "new" }});
      setUserMessages((prev) => [...prev, { sender: "User", text: inputText }]);
      setInputText("");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  // Poll for agent responses (User)
  useEffect(() => {
    if (isConversationEnded) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/customer?id=${Id}&agent_language=en`).then(response => {
          console.log(response);
          console.log(response.data.agentmsg);
        
        if (response.data.agentmsg.length > 0) {
          const message = response.data.agentmsg;
          const newCounter = parseInt(Id) + 1;
          setId(newCounter); 
          localStorage.setItem('counter', newCounter);
          if (message) {
            setUserMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: 'Agent',
                text: message, 
              },
            ]);
          }
          if (response.status === 'ended') {
            setIsConversationEnded(true);
          }
        } 
      });
      } catch (err) {
        setError("Failed to fetch messages. Please try again.");
      }
    }, 5000); // 2 seconds
    return () => clearInterval(interval);

  }, [Id, isConversationEnded]);

  // End conversation
  const endConversation = async () => {
    try {
      setIsConversationEnded(true);
      const formattedMessages = userMessages.reduce((acc, msg, index) => {
        acc[index] = {
            role: index % 2 === 0 ? "User" : "Agent",  
            message: msg.text,
        };
        return acc;
    }, {}); 
    const response = await axios.post(`${BASE_URL}/cutomer-email`, {messages : formattedMessages}, 
      {
          headers: { "Content-Type": "application/json" }
      }
  );
    setUserMessages([]); // Clear the messages
    setChatEndedMessage("Conversation ended. Chat history has been sent to your email.");
    setTimeout(() => {
      setChatEndedMessage(null);
      setChatStarted(false);
    }, 5000); 
    } catch (err) {
      setError("Failed to end conversation. Please try again.");
    }
  };

  return (
    <>
     <div className="max-w-2xl my-5 min-h-screen mx-auto p-6 rounded-lg shadow-lg bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]">
      {/* Chat Messages */}
      <div className="flex justify-center">
        <span className="justify-center font-bold text-xl"> Customer Chat</span>
      </div>
      <div className="my-5 h-svh overflow-y-auto bg-violet-100 p-4 rounded-lg shadow-inner">
        {userMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 max-w-xs rounded-lg text-black ${
              msg.sender === "User" ? "bg-cyan-200 self-start ml-0" : "bg-cyan-200 self-end ml-auto"
            }`}
          >
            <p className="text-l font-semibold">{msg.text}</p>
            <span className="block text-xs text-gray-900">{msg.sender}</span>
          </div>
        ))}
      </div>

      {/* Chat Ended Message */}
      {chatEndedMessage && (
        <p className=" text-gray-900 bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          {chatEndedMessage}</p>
      )}

      {/* Input Field */}
      <textarea
        placeholder="Type your response..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full mt-3 p-2 border rounded-lg min-h-[40px] h-auto resize-y
                  focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition duration-200"
        rows={2} // Initial height
        disabled={isConversationEnded}
      />

      {/* Buttons */}
      {!chatStarted ? (
        <button
          onClick={startChat}
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Start Chat
        </button>
      ) : (
        <div className="flex justify-between mt-3">
          <button
            onClick={sendUserMessage}
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Send
          </button>
          <button
            onClick={endConversation}
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            End Conversation
          </button>
        </div>
      )}
    </div>
    </>
    );
}

export default User;