import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Users, Hash } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function MessagesPanel({
    chatSummary,
    loadMessages,
    sendMessage,
    isAdmin
}) {
    const { user } = useAuth();
    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMsg, setLoadingMsg] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    // Load messages initially when conversation selected
    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }
        let mounted = true;
        setLoadingMsg(true);
        loadMessages(selectedId)
            .then(msgs => {
                if (mounted) {
                    setMessages(msgs);
                    scrollToBottom();
                }
            })
            .catch(console.error)
            .finally(() => {
                if (mounted) setLoadingMsg(false);
            });
        
        return () => { mounted = false; };
    }, [selectedId, loadMessages]);

    // Polling for the active conversation
    useEffect(() => {
        if (!selectedId) return;
        const interval = setInterval(() => {
            loadMessages(selectedId).then(msgs => {
                setMessages(prev => msgs);
            }).catch(console.error);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedId, loadMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedId || sending) return;
        const text = inputText.trim();
        setInputText('');
        setSending(true);
        try {
            const newMsg = await sendMessage(selectedId, text);
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputText(text);
        } finally {
            setSending(false);
        }
    };

    const selectedConv = chatSummary.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex-col md:flex-row gap-4">
            {/* Conversation List */}
            <div className={`flex flex-col w-full md:w-80 shrink-0 overflow-hidden rounded-[6px] border border-[#333333] bg-[#141414] ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="border-b border-[#333333] p-4">
                    <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.15em] text-[#FFFFFF]">
                        Messages
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {chatSummary.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`w-full flex items-center gap-3 rounded-[6px] p-3 text-left transition-colors hover:bg-[#1F1F1F] ${selectedId === conv.id ? 'bg-[#333333]' : ''}`}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-[#FFFFFF]">
                                {conv.type === 'team' ? <Hash className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="truncate text-[13px] font-medium text-[#FFFFFF]">{conv.title}</p>
                                    {conv.unread > 0 && (
                                        <span className="ml-2 rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-[11px] text-[#A3A3A3]">
                                    {conv.last_message ? (
                                        <span className={conv.unread > 0 ? 'text-[#FFFFFF] font-medium' : ''}>
                                            {conv.last_message.is_mine ? 'You: ' : `${conv.last_message.sender_name}: `}
                                            {conv.last_message.text}
                                        </span>
                                    ) : (
                                        conv.subtitle || 'No messages yet'
                                    )}
                                </p>
                            </div>
                        </button>
                    ))}
                    {chatSummary.length === 0 && (
                        <div className="p-4 text-center text-[12px] text-[#C4C4C4]">
                            No conversations available.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col w-full flex-1 overflow-hidden rounded-[6px] border border-[#333333] bg-[#141414] ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-[#333333] p-4">
                            <button 
                                className="md:hidden text-[#C4C4C4] hover:text-[#FFFFFF] mr-2"
                                onClick={() => setSelectedId(null)}
                            >
                                ← Back
                            </button>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-[#FFFFFF]">
                                {selectedConv?.type === 'team' ? <Hash className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="text-[14px] font-medium text-[#FFFFFF]">{selectedConv?.title}</h3>
                                <p className="text-[11px] text-[#C4C4C4]">{selectedConv?.subtitle || (selectedConv?.type === 'team' ? 'Everyone in the studio' : '')}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMsg ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#333333] border-t-[#FFFFFF]" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-[12px] text-[#C4C4C4]">
                                    Send a message to start the conversation.
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const showName = !msg.is_mine && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                                            {showName && (
                                                <span className="mb-1 text-[11px] font-medium text-[#C4C4C4] ml-1">
                                                    {msg.sender_name} {msg.sender_role === 'admin' ? '(Admin)' : ''}
                                                </span>
                                            )}
                                            <div className={`max-w-[85%] rounded-[12px] px-4 py-2 text-[13px] ${
                                                msg.is_mine 
                                                    ? 'bg-[#FFFFFF] text-[#080808] font-medium rounded-br-[4px]' 
                                                    : 'bg-[#1F1F1F] text-[#FFFFFF] border border-[#333333] rounded-bl-[4px]'
                                            }`}>
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="border-t border-[#333333] p-4 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-[6px] border border-[#333333] bg-[#080808] px-4 py-2 text-[13px] text-[#FFFFFF] placeholder:text-[#A3A3A3] focus:border-[#FFFFFF] focus:outline-none"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || sending}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#FFFFFF] text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-[13px] text-[#C4C4C4]">
                        Select a conversation to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
}
