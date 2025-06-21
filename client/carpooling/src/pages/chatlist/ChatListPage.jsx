import './ChatListPage.css';

const chats = [
  {
    id: 1,
    name: 'Alice Johnson',
    lastMessage: 'See you tomorrow!',
    time: '10:15 AM',
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: 2,
    name: 'Bob Smith',
    lastMessage: 'Got it, thanks!',
    time: '9:50 AM',
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: 3,
    name: 'Charlie',
    lastMessage: 'Let’s catch up later.',
    time: 'Yesterday',
    avatar: 'https://via.placeholder.com/40',
  },
];

const ChatListPage = () => {
  return (
    <div className="chat-list-container">
      <div className="chat-list-header">Chats</div>
      <div className="chat-list">
        {chats.map(chat => (
          <div key={chat.id} className="chat-list-item">
            <div className="chat-info">
              <div className="chat-name-time">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-message">{chat.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListPage;
