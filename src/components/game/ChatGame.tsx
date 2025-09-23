import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/context/userContext'
import { getGameHub } from '@/services/gameHub'
import { IoSend, IoChatbubbleEllipses, IoCloseSharp } from "react-icons/io5";
import { ChatGameProps, ChatMessage } from '@/types/ChatTypes';

export default function ChatGame({ roomCode, isCollapsed = false }: Readonly<ChatGameProps>) {
  const { id: userId, username } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(!isCollapsed)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleIncomingChatMessage(msg: ChatMessage, setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) {
    if (msg?.id && msg?.username && msg?.message) {
      setMessages(prev => {
        const exists = prev.some(existingMsg => existingMsg.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
    }
  }

  useEffect(() => {

    if (!roomCode || !username || !userId) return;

    const chatHandler = (msg: ChatMessage) => {
      handleIncomingChatMessage(msg, setMessages);
    };

    const hub = getGameHub(roomCode, username);
    
    const cleanup = hub.registerHandlers({
      onChatMessage: chatHandler,
      onPlayerJoined: (_username) => {},
      onPlayerLeft: (_username) => {}
    });

    hub.start().catch(console.error);

    return () => {
      cleanup();
    };
  }, [roomCode, username, userId]); 

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomCode || !username || !userId) return;

    try {
      const hub = getGameHub(roomCode, username)
      await hub.sendChatMessage(roomCode, username, newMessage.trim())
      setNewMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error sending chat message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  if (!userId) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <span className="text-sm">Chat disabled</span>
        </div>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <IoChatbubbleEllipses size={40} />
          {messages.length > 0 && (
            <span className="bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-90 h-96 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg flex flex-col z-50 shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-white/20 bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">💬 Room Chat</span>
          <span className="text-white/60 text-xs">#{roomCode}</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white/60 hover:text-white transition-colors p-1"
          title="Close chat"
        >
          <IoCloseSharp size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-white/50 text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg.id}-${index}`}
              className={`text-sm ${
                msg.isSystem
                  ? 'text-yellow-400 italic text-center'
                  : msg.username === username
                  ? 'text-right'
                  : 'text-left'
              }`}
            >
              {msg.isSystem ? (
                <div className="bg-yellow-400/10 px-2 py-1 rounded text-xs border border-yellow-400/20">
                  {msg.message}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] inline-block px-3 py-2 rounded-lg ${
                    msg.username === username
                      ? 'bg-purple-600 text-white ml-auto'
                      : 'bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="text-xs mb-1 flex">
                    <span className={`font-bold ${
                      msg.username === username 
                        ? 'text-yellow-300' 
                        : 'text-cyan-300'
                    }`}>
                      [{msg.username === username ? 'You' : msg.username}]: <span className="break-words text-white">{msg.message} </span>
                    </span>
                  </div>
    
                  <div className="text-xs text-white/50 mt-1 text-right">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/20 bg-black/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            maxLength={50}
            disabled={!username || !userId}
            className="flex-1 bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !username || !userId}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 min-w-[48px] ${
              newMessage.trim() && username && roomCode && userId
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <IoSend size={20} />
          </button>
        </div>
        <div className="text-xs text-white/50 mt-1 flex justify-between">
          <span>{newMessage.length}/50</span>
          {!userId && (
            <span className="text-red-400">• Not connected</span>
          )}
        </div>
      </div>
    </div>
  )
}