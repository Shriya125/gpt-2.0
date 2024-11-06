import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./app.css";

function ChatMessage({ message, type }) {

  const messageLines = message.split('\n');

  return (
    <div
      className={`flex w-full mb-3 ${
        type === "send" ? "justify-start" : "justify-end"
      }`}
    >
      {type === "send" ? (
        <div className="bg-violet-500 p-2 rounded-b-lg rounded-tr-lg text-white">
          {messageLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="bg-white p-2 rounded-b-lg rounded-tl-lg text-black">
          {messageLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [socket, setSocket] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:8060");
    setSocket(newSocket);

    newSocket.on("response", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "receive",
          message,
        },
      ]);
    });

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "send",
          message: inputMessage,
        },
      ]);
      socket.emit("message", inputMessage);
      setInputMessage(""); // Clear input field after sending
    }
  };

  return (
    <div className="p-5 h-screen bg-black">
      <div className="container mx-auto bg-gray-900 h-full flex flex-col">
        <div className="flex-grow p-3 flex flex-row items-end">
          <div className="w-full space-y-3 overflow-y-scroll hide-scrollbar h-[70vh]">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.message}
                type={message.type}
              />
            ))}
          </div>
        </div>

        <div className="h-[100px] p-3 flex justify-center items-center bg-gray-700">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type Something..."
            type="text"
            className="w-full p-2 bg-transparent text-white border-2 border-white rounded-md outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-violet-600 px-3 py-2 rounded-md mx-2 text-white cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
