import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
    role: 'user' | 'agent';
    content: string;
    thought?: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="panel chat-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">Assistant</div>
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.thought && (() => {
                            //const match = msg.thought.match(/^\*\*([^*]+)\*\*\s*/);
                            const allMatches = [...msg.thought.matchAll(/\*\*([^*]+)\*\*/g)];

                            // 3. Grab the last match found, or default to 'Thinking Process'
                            const lastMatch = allMatches.length > 0 ? allMatches[allMatches.length - 1] : null;
                            const title = lastMatch ? lastMatch[1] : 'Thinking Process';
                            const content = msg.thought;
                            return (
                                <details className="thinking-process" style={{ marginBottom: '8px', fontSize: '0.9em', color: '#8b949e' }}>
                                    <summary style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}>{title}</summary>
                                    <div style={{
                                        whiteSpace: 'pre-wrap',
                                        marginTop: '4px',
                                        padding: '8px',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                        borderLeft: '2px solid #58a6ff'
                                    }}>
                                        {content}
                                    </div>
                                </details>
                            );
                        })()}
                        {msg.content}
                    </div>
                ))}
                {isLoading && <div className="message agent">Thinking...</div>}
            </div>
            <form className="chat-input" onSubmit={handleSubmit}>
                <div style={{ position: 'relative' }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe what to build..."
                    />
                    <button
                        type="submit"
                        style={{ position: 'absolute', right: 8, top: 6, background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer' }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
