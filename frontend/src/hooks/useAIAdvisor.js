import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

/**
 * Hook for managing the AI Financial Advisor chat session.
 * Handles message history, API communication, and typewriter state management.
 */
export const useAIAdvisor = (initialUser) => {
  const [messages, setMessages] = useState([
    {
      role: 'ai', 
      content: `Hi **${initialUser?.fullName || 'there'}**! I'm your AI financial advisor.\n\nI've analyzed your recent financial data and I'm ready to help you save more and spend smarter. Ask me anything!`,
      isNew: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = { 
      role: 'user', 
      content: messageText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await apiClient.post('/api/v1/ai/chat', { message: messageText });
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.reply || data.message, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I'm having a little trouble connecting to the neural core. Could you please try again?", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true
      }]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  const markMessageAsRead = useCallback((index) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[index]) {
        newMessages[index].isNew = false;
      }
      return newMessages;
    });
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    markMessageAsRead
  };
};
