import React from 'react';

const Main = () => {
  const messages = [
    { id: 1, text: 'Hello!', sender: 'user' },
    { id: 2, text: 'Hi there! How can I help you today?', sender: 'ai' },
    { id: 3, text: 'I need help with my account.', sender: 'user' },
    { id: 4, text: 'Of course. What seems to be the problem?', sender: 'ai' },
  ];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Agents Demo</h2>
      </div>
      <div className="chat-area">
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.sender}`}>
            <div className="message-sender">{message.sender === 'user' ? 'User' : 'Agent'}</div>
            <div className={`message`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-message-bar">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
};

export default Main;
