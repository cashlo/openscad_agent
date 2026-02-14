import { useState, useRef } from 'react';
import './App.css';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { CodeEditor } from './components/CodeEditor';
import { OpenSCADViewer, type OpenSCADViewerRef } from './components/OpenSCADViewer';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'agent';
  content: string;
  thought?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hello! I am your OpenSCAD agent. Describe a 3D model, and I will generate the code for you.' }
  ]);
  const [code, setCode] = useState<string>('// Generated OpenSCAD code will appear here\ncube([10, 10, 10], center=true);\n');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const viewerRef = useRef<OpenSCADViewerRef>(null);

  const generateStream = async (currentMessages: Message[]) => {
    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'agent', content: 'Please set your Gemini API Key in the settings (top right).' }]);
        setIsLoading(false);
        return;
      }

      const client = new GoogleGenAI({ apiKey });

      // Capture screenshot
      let screenshot = null;
      if (viewerRef.current) {
        screenshot = viewerRef.current.captureScreenshot();
      }

      // System Instructions
      const systemInstruction = `You are an expert OpenSCAD programmer. 
      Your task is to generate OpenSCAD code based on the user's description.
      - Return ONLY the OpenSCAD code.
      - Do not include markdown backticks or explanations.
      - Ensure the code is valid.
      - Use 'fn=100' for smooth circles/spheres unless low poly is requested.
      - Always center objects unless requested otherwise.
      
      Current Code:
      ${code}`;

      const contents = currentMessages.map(m => {
        const role = m.role === 'agent' ? 'model' : 'user';
        const parts: any[] = [{ text: m.content }];

        // Attach screenshot to the LAST user message if available
        if (role === 'user' && m === currentMessages[currentMessages.length - 1] && screenshot) {
          const base64Data = screenshot.split(',')[1];
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: base64Data
            }
          });
        }
        return { role, parts };
      });

      // Call Gemini API with Streaming and Thinking
      // @ts-ignore
      const response = await client.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          temperature: 0.1,
          thinkingConfig: {
            includeThoughts: true
          }
        }
      });

      let accumulatedText = "";
      let accumulatedThought = "";

      // Add placeholder agent message
      setMessages(prev => [...prev, { role: 'agent', content: '', thought: '' }]);

      for await (const chunk of response) {
        // @ts-ignore
        if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
          // @ts-ignore
          for (const part of chunk.candidates[0].content.parts) {
            if (part.thought) {
              accumulatedThought += part.text;
            } else if (part.text) {
              accumulatedText += part.text;
            }
          }

          // Update UI with streaming content
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'agent',
              content: accumulatedText,
              thought: accumulatedThought
            };
            return updated;
          });
        }
      }

      let generatedCode = accumulatedText;

      // Strip backticks
      if (generatedCode.startsWith('```openscad')) {
        generatedCode = generatedCode.replace('```openscad', '').replace('```', '');
      } else if (generatedCode.startsWith('```')) {
        generatedCode = generatedCode.replace('```', '').replace('```', '');
      }

      generatedCode = generatedCode.trim();
      setCode(generatedCode);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error communicating with the API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    setRetryCount(0); // Reset retries on new user intent
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    await generateStream(newMessages);
  };

  const handleCompilationError = async (errorMsg: string) => {
    if (retryCount >= 3) {
      setMessages(prev => [...prev, { role: 'agent', content: `I tried to fix the code 3 times but failed. Error: ${errorMsg}` }]);
      return;
    }

    console.log(`Auto-correcting (Attempt ${retryCount + 1})... Error: ${errorMsg}`);
    setRetryCount(prev => prev + 1);

    const errorMessage = `The previous code failed to compile with error:\n${errorMsg}\n\nPlease fix the OpenSCAD code.`;
    // We append this as a user message so the model sees it as a request/constraint
    const newMessages: Message[] = [...messages, { role: 'user', content: errorMessage }];
    setMessages(newMessages);

    await generateStream(newMessages);
  };

  return (
    <Layout>
      <div className="sidebar">
        <div className="chat-area">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
        <div className="editor-area">
          <CodeEditor code={code} onChange={setCode} />
        </div>
      </div>
      <div className="viewer-area">
        <OpenSCADViewer ref={viewerRef} code={code} onError={handleCompilationError} />
      </div>
    </Layout>
  );
}

export default App;
