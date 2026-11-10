import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Compass,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  GitFork,
  LayoutGrid,
  FileText,
  CheckSquare,
  Circle,
} from 'lucide-react';
import { BoardObject, StickyObject } from '@whiteboard/shared';
import { executeAgentCommand } from '../utils/ai/canvasAgent';

interface AiAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  onAddObject?: (obj: BoardObject) => void;
  onAddObjects?: (objs: BoardObject[]) => void;
  onUpdateObject?: (id: string, update: Partial<BoardObject>) => void;
  boardId: string;
  camera: { x: number; y: number; zoom: number };
  objects: BoardObject[];
  selectedIds?: string[];
}

interface ChatCard {
  title: string;
  desc: string;
  bg: string;
  border: string;
  textColor: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedCards?: ChatCard[];
  actionTaken?: string;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  isOpen,
  onClose,
  onAddObject,
  onAddObjects,
  onUpdateObject,
  boardId,
  camera,
  objects,
  selectedIds = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. ISOLATED PER-BOARD CHATROOM PERSISTENCE
  useEffect(() => {
    try {
      const storageKey = `sankalp_ai_chatroom_${boardId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }

      // Initialize unique chat for this board
      const initialWelcome: ChatMessage = {
        id: `welcome-${boardId}`,
        sender: 'assistant',
        text: `👋 Canvas Agent ready for this board!\n\nI can execute instructions directly on your canvas. Tell me what to do:\n• "add a circle" or "draw a red circle"\n• "draw a square" or "add a decision diamond"\n• "add a sticky saying [your note]"\n• "add text 'Sprint Planning'"\n• "organize my notes" or "summarize the board"`,
        timestamp: 'Just now',
        suggestedCards: [
          {
            title: 'Agentic Canvas Control',
            desc: 'Tell me "add a circle", "draw a terracotta square", or "make an arrow" to create shapes instantly',
            bg: '#F6E7DE',
            border: '#A2502F',
            textColor: '#A2502F',
          },
          {
            title: 'Board-Isolated Memory',
            desc: 'This chatroom is uniquely dedicated and saved for this specific board',
            bg: '#FAFAF7',
            border: '#D9D8D5',
            textColor: '#1A1917',
          },
        ],
      };
      setMessages([initialWelcome]);
      localStorage.setItem(storageKey, JSON.stringify([initialWelcome]));
    } catch (e) {
      console.error('Failed to load board chatroom history', e);
    }
  }, [boardId]);

  // Helper to persist messages for this board
  const saveMessagesForBoard = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem(`sankalp_ai_chatroom_${boardId}`, JSON.stringify(newMsgs));
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  // Close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlaceCardOnCanvas = (card: ChatCard, indexOffset = 0) => {
    if (!onAddObject) return;

    const col = indexOffset % 3;
    const row = Math.floor(indexOffset / 3);

    const newSticky: StickyObject = {
      id: `ai-sticky-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      boardId,
      type: 'sticky',
      x: camera.x - 120 + col * 190,
      y: camera.y - 80 + row * 160,
      width: 170,
      height: 140,
      rotation: 0,
      zIndex: objects.length + 1 + indexOffset,
      locked: false,
      createdBy: 'ai-agent',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: card.bg || '#fef08a',
      text: `${card.title}\n\n${card.desc}`,
      fontSize: 13,
      textAlign: 'left',
      textColor: '#0f172a',
    };

    onAddObject(newSticky);
    showNotification('Placed note on whiteboard!');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMsg];
    saveMessagesForBoard(updatedWithUser);
    setInputText('');
    setIsTyping(true);

    try {
      // 2. TRUE CANVAS AGENT EXECUTION
      const result = await executeAgentCommand(text, {
        boardId,
        camera,
        objects,
        selectedIds,
        onAddObject,
        onAddObjects,
        onUpdateObject,
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: result.actionTaken,
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      saveMessagesForBoard(finalMessages);

      if (result.actionTaken) {
        showNotification(result.reply.split('\n')[0]);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `Encountered an issue executing that command: ${err?.message || 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveMessagesForBoard([...updatedWithUser, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    const resetMsg: ChatMessage = {
      id: `welcome-${boardId}-${Date.now()}`,
      sender: 'assistant',
      text: `👋 Chatroom reset for this board. What would you like me to build or draw?`,
      timestamp: 'Just now',
    };
    saveMessagesForBoard([resetMsg]);
    showNotification('Cleared chat history for this board.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed right-3 top-16 bottom-3 w-[420px] max-w-[calc(100vw-1.5rem)] bg-[#FAFAF7]/98 backdrop-blur-2xl border border-[#D9D8D5] shadow-2xl rounded-3xl flex flex-col z-50 overflow-hidden select-text pointer-events-auto"
          aria-label="Sankalp AI Copilot"
        >
          {/* Header Bar */}
          <div className="px-4 py-3.5 border-b border-[#D9D8D5] flex items-center justify-between bg-[#FAFAF7] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1A1917] flex items-center justify-center text-[#FAFAF7] shadow-sm">
                <Sparkles className="w-4 h-4 fill-current text-[#D9542C]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#1A1917]">Sankalp Canvas Agent</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#F6E7DE] text-[#A2502F] rounded-md border border-[#D9D8D5]">
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#5E5C56]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9542C] animate-pulse" />
                  <span>Dedicated Board Chatroom</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat for this Board"
                className="p-1.5 text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE] rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                title="Close AI Agent (Esc)"
                className="p-1.5 text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE] rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick AI Action Pills Bar */}
          <div className="px-3 py-2 bg-[#FAFAF7] border-b border-[#D9D8D5] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
            <button
              onClick={() => handleSendMessage('Add a circle')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F6E7DE] text-[#1A1917] hover:text-[#A2502F] border border-[#D9D8D5] rounded-full transition shadow-2xs font-medium cursor-pointer"
            >
              <Circle className="w-3 h-3 text-[#D9542C]" />
              <span>+ Circle</span>
            </button>

            <button
              onClick={() => handleSendMessage('Create Cloud Microservices Architecture flow')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F6E7DE] text-[#1A1917] hover:text-[#A2502F] border border-[#D9D8D5] rounded-full transition shadow-2xs font-medium cursor-pointer"
            >
              <GitFork className="w-3 h-3 text-[#A2502F]" />
              <span>+ Flowchart</span>
            </button>

            <button
              onClick={() => handleSendMessage('Auto-organize my notes into a grid')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F6E7DE] text-[#1A1917] hover:text-[#A2502F] border border-[#D9D8D5] rounded-full transition shadow-2xs font-medium cursor-pointer"
            >
              <LayoutGrid className="w-3 h-3 text-[#5E5C56]" />
              <span>Organize</span>
            </button>

            <button
              onClick={() => handleSendMessage('Summarize the board')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F6E7DE] text-[#1A1917] hover:text-[#A2502F] border border-[#D9D8D5] rounded-full transition shadow-2xs font-medium cursor-pointer"
            >
              <FileText className="w-3 h-3 text-[#D9542C]" />
              <span>Summarize</span>
            </button>

            <button
              onClick={() => handleSendMessage('Convert notes to sprint tasks')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F6E7DE] text-[#1A1917] hover:text-[#A2502F] border border-[#D9D8D5] rounded-full transition shadow-2xs font-medium cursor-pointer"
            >
              <CheckSquare className="w-3 h-3 text-[#A2502F]" />
              <span>To Tasks</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mx-4 mt-2 p-2.5 bg-[#F6E7DE] border border-[#A2502F]/30 text-[#A2502F] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
              <Check className="w-3.5 h-3.5 text-[#D9542C]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#FAFAF7]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1917] text-[#FAFAF7] rounded-tr-xs'
                      : 'bg-white text-[#1A1917] rounded-tl-xs border border-[#D9D8D5] shadow-xs'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                  {/* Brainstorming Sticky Cards with Real Physical Pastel Backgrounds */}
                  {msg.suggestedCards && msg.suggestedCards.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Suggested Notes ({msg.suggestedCards.length})
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.suggestedCards.map((card, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: card.bg,
                              borderColor: card.border,
                            }}
                            className="p-2.5 rounded-xl border border-l-4 shadow-2xs flex items-start justify-between gap-2 group transition"
                          >
                            <div className="flex-1 min-w-0">
                              <div
                                style={{ color: card.textColor }}
                                className="font-bold text-xs"
                              >
                                {card.title}
                              </div>
                              <div className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                                {card.desc}
                              </div>
                            </div>
                            <button
                              onClick={() => handlePlaceCardOnCanvas(card, idx)}
                              title="Add sticky note to canvas"
                              className="shrink-0 p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp & Copy action */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-slate-600 transition flex items-center gap-0.5 cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-[#5E5C56] bg-white w-fit px-3 py-2 rounded-2xl border border-[#D9D8D5] shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#D9542C] animate-spin" />
                <span className="text-[11px] font-medium text-[#1A1917]">
                  Executing canvas command...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-[#D9D8D5] bg-[#FAFAF7] shrink-0">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#D9542C]/20 focus-within:border-[#D9542C] border border-[#D9D8D5] transition">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask agent: 'add a circle', 'draw a terracotta square', 'make a flow'..."
                rows={1}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-[#1A1917] placeholder:text-[#5E5C56]/60 outline-none resize-none max-h-24 leading-relaxed"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="shrink-0 p-2 bg-[#1A1917] hover:bg-[#D9542C] text-[#FAFAF7] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition cursor-pointer"
                title="Send Command (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5E5C56] px-1 pt-1.5">
              <span>Press Enter to execute &bull; Shift+Enter for new line</span>
              <span className="text-[#A2502F] font-semibold">Sankalp Canvas Agent</span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
