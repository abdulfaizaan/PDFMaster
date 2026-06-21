"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Message } from "ai";
import { extractTextFromPdf } from "@/lib/pdf-extractor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2, Send, Bot, User, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      documentContext: pdfContext,
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    try {
      setIsExtracting(true);
      setFileName(file.name);
      
      // Extract text locally in the browser
      const text = await extractTextFromPdf(file);
      setPdfContext(text);
      
      // Clear previous chat
      setMessages([]);
      
    } catch (err) {
      console.error(err);
      alert("Failed to read PDF. It might be corrupted or password protected.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearDocument = () => {
    setPdfContext(null);
    setFileName(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight text-ink">Chat with PDF</h1>
          <p className="text-body text-base mt-1 text-muted-foreground">
            Powered by Groq & Llama 3 for instant answers.
          </p>
        </div>
        
        {fileName && (
          <Button variant="outline" size="sm" onClick={clearDocument} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Remove PDF
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        {/* Left Side: Upload Zone */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <Card className="flex-1 p-6 border-dashed border-2 flex flex-col items-center justify-center text-center bg-surface-dark/5 transition-colors">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            {isExtracting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="font-medium text-ink">Reading document...</p>
                <p className="text-sm text-muted-foreground mt-2">Extracting text locally for privacy.</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <FileUp className="w-8 h-8" />
                </div>
                <p className="font-medium text-ink truncate max-w-[200px]">{fileName}</p>
                <p className="text-sm text-green-600 font-medium mt-2">Document loaded & ready!</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Different File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <FileUp className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Upload a PDF</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Drag and drop or click to browse. Max size: 20MB.
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Chat Interface */}
        <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm">
          {!pdfContext ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Bot className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">I'm ready when you are.</p>
              <p className="text-sm">Upload a document to the left to start analyzing it.</p>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6"
              >
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    <p>Ask me anything about {fileName}!</p>
                  </div>
                )}
                
                {messages.map((m: Message) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id} 
                    className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm text-ink'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</p>
                    </div>

                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-secondary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150" />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-background border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim() || isLoading) return;
                    handleSubmit(e);
                  }} 
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask a question about the document..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={!input.trim() || isLoading} className="shrink-0">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
