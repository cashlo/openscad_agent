import React from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
    return (
        <div className="panel code-panel">
            <div className="panel-header">SCAD Code</div>
            <textarea
                className="code-editor"
                value={code}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
            />
        </div>
    );
};
