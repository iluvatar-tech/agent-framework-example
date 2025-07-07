import { useState, useEffect, useRef } from 'react';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const API_BASE_URL = 'http://localhost:3002'; 

const runAgent = async (objective: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/agent/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objective }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.result;
};

const Main = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat area when messages change
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessageText.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: newMessageText.trim(),
      sender: 'user' as const,
    }
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setNewMessageText('');
    setIsLoading(true); // Set loading to true when agent starts processing

    // Call the agent with the user's message via the server
    const agentResponse = await runAgent(userMessage.text);
    const aiMessage = {
      id: Date.now() + 1,
      text: agentResponse,
      sender: 'ai' as const,
    };
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    setIsLoading(false); // Set loading to false after agent responds
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Agents Demo</h2>
      </div>
      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.sender}`}>
            <div className="message-sender">{message.sender === 'user' ? 'User' : 'Agent'}</div>
            <div className={`message`}>
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="message-sender">Agent</div>
            <div className="message">Thinking...</div>
          </div>
        )}
      </div>
      <div className="chat-message-bar">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          disabled={isLoading} // Disable input while loading
        />
        <button onClick={handleSendMessage} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
};

export default Main;
