import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { chatWithAssistant, type ChatContext } from '../services/ai';
import type { ChatMessage } from '../types';

export const Chatbot: React.FC = () => {
    const { user, currentPlan, completedMeals, todayIndex, waterGlasses, waterGoal, chatHistory, addChatMessage, clearChatHistory } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!inputText.trim() || !user) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputText,
            timestamp: new Date()
        };

        addChatMessage(userMessage);
        setInputText('');
        setIsTyping(true);

        // Prepare context for AI
        const context: ChatContext = {
            user,
            currentPlan,
            completedMeals,
            todayIndex,
            waterGlasses,
            waterGoal
        };

        // Build conversation history for AI
        const conversationHistory = chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Get AI response
        const response = await chatWithAssistant(inputText, conversationHistory, context);

        setIsTyping(false);

        if (response) {
            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date()
            };
            addChatMessage(assistantMessage);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickSuggestions = [
        "What should I eat today?",
        "What's my BMI?",
        "How many calories have I eaten?",
        "Suggest a healthier dinner"
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-40"
                    >
                        🤖
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full sm:max-w-md sm:h-[600px] h-screen rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-3xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                                        🤖
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Khaalo Assistant</h3>
                                        <p className="text-xs text-white/80">Powered by GPT-4o</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-5xl mb-3">👋</div>
                                        <p className="text-gray-600 mb-4">Hi {user?.name}! I'm your nutrition assistant.</p>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500 font-semibold">Quick suggestions:</p>
                                            {quickSuggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setInputText(suggestion);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm text-purple-700 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {chatHistory.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            <span className="text-xs opacity-60 mt-1 block">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-100">
                                {chatHistory.length > 0 && (
                                    <button
                                        onClick={clearChatHistory}
                                        className="text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                                    >
                                        <span>🗑️</span> Clear conversation
                                    </button>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-purple-500"
                                        disabled={isTyping}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputText.trim() || isTyping}
                                        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
