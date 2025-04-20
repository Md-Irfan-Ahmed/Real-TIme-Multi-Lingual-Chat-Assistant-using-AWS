import axios from "axios";
import { useState, useEffect } from "react";

const BASE_URL = "{WEBSITE_URL}"; 

const Agent = () => {
  const [agentMessages, setAgentMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [Id, setId] = useState(() => {
    localStorage.setItem('counter1', parseInt(1));
    const savedCounter = localStorage.getItem('counter1');
    return savedCounter;
  });
  const [Id1, setId1] = useState(() => {
    localStorage.setItem('counter2', parseInt(1));
    const savedCounter = localStorage.getItem('counter2');
    return savedCounter;
  });
  const [chatEndedMessage, setChatEndedMessage] = useState(null);

  // Poll for user messages (Agent)
    

  useEffect(() => {
    if (isConversationEnded) return;

    // Fetch messages every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/agent?id=${Id1}`);
        if (response.data) {
          const message = response.data;
          const newCounter1 = parseInt(Id1) + 1;
          setId1(newCounter1); 
          localStorage.setItem('counter2', newCounter1);
          if (message && message.usermsg) {
            setAgentMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: 'User',
                text: message.usermsg, 
              },
            ]);
          }
          if (!message.usermsg || message.status === 'ended') {
            setIsConversationEnded(true);
          }
        }
      } catch (err) {
        setError("Failed to fetch messages. Please try again.");
      }
    }, 5000); // 2 seconds
    return () => clearInterval(interval);

  }, [Id1,isConversationEnded]);

  const endConversation = async () => {
    try {
      setIsConversationEnded(true);
      setAgentMessages([]); // Clear the messages
      setChatEndedMessage("Conversation ended.");
      setTimeout(() => {
        setChatEndedMessage(null);
      }, 500000);  
    } catch (err) {
      setError("Failed to end conversation. Please try again.");
    }
  };

  // Send a message (Agent)
  const sendAgentMessage = async () => {
    if (!inputText.trim()) return;
    try {
        const response= await axios.put(`${BASE_URL}/agent/`, { id : Id, agentmsg : inputText, status: "responded" }).then( res =>
            {
              const newCounter = parseInt(Id) + 1;
            setId(newCounter); 
            localStorage.setItem('counter1', newCounter);
            setAgentMessages((prev) => [...prev, { sender: "Agent", text: inputText }]);
            setInputText("");
          });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };
    return (
    <>
    <div className="max-w-2xl my-5 min-h-screen mx-auto p-6 rounded-lg shadow-lg bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]">
      {/* Chat Messages */}
      <div className="flex justify-center">
        <span className="justify-center font-bold text-xl"> Agent Chat</span>
      </div>
      <div className="my-5 h-svh overflow-y-auto bg-violet-100 p-4 rounded-lg shadow-inner">
        {agentMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 max-w-xs rounded-lg text-black ${
              msg.sender === "User" ? "bg-cyan-200 self-end ml-auto " : "bg-cyan-200 self-start"
            }`}
          >
            <p className="text-l font-semibold">{msg.text}</p>
            <span className="block text-xs text-gray-900">{msg.sender}</span>
          </div>
        ))}
      </div>

      {/* Chat Ended Message */}
      {chatEndedMessage && (
        <p className="text-gray-900 bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
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
      <div className="flex justify-between mt-3">
        <button
          onClick={sendAgentMessage}
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          disabled={isConversationEnded}
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
    </div>
        </>
    )
}

export default Agent;