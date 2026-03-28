'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, MessageSquare, Send, User, Bot, Clock, CheckCircle2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch of active sessions
    useEffect(() => {
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (error) console.error('Error fetching sessions:', error);
            else {
                setSessions(data || []);
                if (data && data.length > 0 && !activeSession) {
                    setActiveSession(data[0]);
                }
            }
            setLoading(false);
        };

        fetchSessions();

        // Subscribe to new sessions
        const sessionChannel = supabase
            .channel('public:chat_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setSessions(prev => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sessionChannel);
        };
    }, []);

    // Fetch messages for active session
    useEffect(() => {
        if (!activeSession) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', activeSession.id)
                .order('created_at', { ascending: true });
            
            if (error) console.error('Error fetching messages:', error);
            else setMessages(data || []);
        };

        fetchMessages();

        // Subscribe to messages for this session
        const messageChannel = supabase
            .channel(`public:chat_messages:session_${activeSession.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages', 
                filter: `session_id=eq.${activeSession.id}` 
            }, (payload) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
        };
    }, [activeSession]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeSession) return;

        const content = inputText.trim();
        setInputText('');

        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: activeSession.id,
                    sender_type: 'agent',
                    content: content
                });
            
            if (error) throw error;

            // Update session timestamp
            await supabase
                .from('chat_sessions')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', activeSession.id);

        } catch (error) {
            console.error('Error sending agent message:', error);
        }
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>;
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Sessions Sidebar */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-black text-[#0b1315] uppercase tracking-tight mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search chats..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {sessions.length > 0 ? sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setActiveSession(session)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                activeSession?.id === session.id 
                                    ? 'bg-white shadow-sm border border-gray-100 ring-1 ring-emerald-500/10' 
                                    : 'hover:bg-white hover:shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                            }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-emerald-600" />
                                </div>
                                {session.status === 'active' && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="font-black text-[#0b1315] text-xs uppercase truncate">
                                        {session.visitor_name || 'Anonymous Guest'}
                                    </h4>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                                        {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-widest">
                                    Visitor ID: {session.visitor_id.slice(-6)}
                                </p>
                            </div>
                        </button>
                    )) : (
                        <div className="text-center py-20 px-6">
                            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active chats yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Content */}
            {activeSession ? (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Active Session Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#0b1315] text-sm uppercase tracking-tight">
                                    {activeSession.visitor_name || 'Anonymous Guest'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Now • {activeSession.visitor_id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                                <Clock size={18} />
                             </button>
                             <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                                <MoreVertical size={18} />
                             </button>
                             <button className="bg-emerald-500 text-[#0b1315] font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-emerald-400 transition-all shadow-sm">
                                Close Case
                             </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                        <div className="flex flex-col items-center mb-8">
                            <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Beginning of conversation
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex flex-col ${msg.sender_type === 'agent' ? 'items-end' : 'items-start'}`}
                            >
                                <div 
                                    className={`max-w-[70%] px-5 py-3.5 text-sm font-medium leading-relaxed ${
                                        msg.sender_type === 'agent' 
                                            ? 'bg-[#0b1315] text-white rounded-3xl rounded-tr-none' 
                                            : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-3xl rounded-tl-none'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div className="p-6 bg-white border-t border-gray-100">
                        <form 
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/10 transition-all"
                        >
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Write your response..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400 px-4"
                            />
                            <button 
                                type="submit"
                                disabled={!inputText.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-[#0b1315] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Send
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 text-center p-12">
                    <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-[#0b1315] uppercase tracking-tight mb-3">Select a conversation</h3>
                    <p className="text-gray-500 max-w-sm font-medium text-sm">
                        Choose a guest from the left panel to start assisting them with their safari planning.
                    </p>
                </div>
            )}
        </div>
    );
}
