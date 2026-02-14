import React, { useState } from 'react';
import { Settings, Box } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
    const [showSettings, setShowSettings] = useState(false);

    const handleSaveKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('openai_api_key', key);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">
                    <Box className="icon" />
                    <h1>OpenSCAD Agent</h1>
                </div>
                <div className="header-controls">
                    <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {showSettings && (
                <div className="settings-panel">
                    <h3>Settings</h3>
                    <div className="input-group">
                        <label>Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => handleSaveKey(e.target.value)}
                            placeholder="AIzaSy..."
                        />
                    </div>
                </div>
            )}

            <main className="app-main">
                {children}
            </main>
        </div>
    );
};
