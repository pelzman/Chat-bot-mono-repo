import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Toaster, toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginUser, registerUser, sendMessage, getMe, logoutUser, getConversations, getConversationMessages } from './api/client';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Send, User as UserIcon, Bot, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState<{ id: string, name: string, email?: string } | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  // Check for existing session
  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const data = await getMe();
        setUser(data);
        return data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <Toaster />
        <AuthScreen onLogin={setUser} isLogin={isLogin} setIsLogin={setIsLogin} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <ChatScreen user={user} onLogout={handleLogout} />
    </>
  );
}

function AuthScreen({ onLogin, isLogin, setIsLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      onLogin(data);
    },
    onError: () => toast.error('Login failed')
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('User created successfully. Please log in.');
      setIsLogin(true);
    },
    onError: () => toast.error('Registration failed')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, name });
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 -z-10" />
      <Card className="w-[400px] border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <Bot size={24} />
          </div>
          <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription className="text-zinc-400">
            {isLogin ? 'Enter your details to access your bot.' : 'Sign up to start chatting.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            )}
            <div className="space-y-2">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function ChatScreen({ user, onLogout }: any) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([
    { id: '1', role: 'system', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });

  const initialLoadDone = React.useRef(false);
  React.useEffect(() => {
    if (!initialLoadDone.current && conversations.length > 0) {
      setConversationId(conversations[0].id);
      initialLoadDone.current = true;
    }
  }, [conversations]);

  const { data: history } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationId ? getConversationMessages(conversationId) : null,
    enabled: !!conversationId
  });

  React.useEffect(() => {
    if (history) {
      setMessages(history.map((m: any) => ({
        id: m.id,
        role: m.sender,
        content: m.content
      })));
    }
  }, [history]);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([{ id: '1', role: 'system', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
  };

  const chatMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      setMessages(prev => [...prev, { id: data.id || Date.now().toString(), role: data.sender || 'assistant', content: data.content || 'Message received' }]);
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
    onError: () => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Sorry, I encountered an error.' }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    chatMutation.mutate({ content: input, userId: user.id, conversationId });
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">AI Assistant</h2>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400"></span> Online
            </p>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conversations</h3>
            <Button onClick={handleNewChat} variant="ghost" size="sm" className="h-6 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800/50 transition-colors">
              New Chat
            </Button>
          </div>
          <div className="space-y-1">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setConversationId(conv.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors ${conversationId === conv.id ? 'bg-zinc-800/50 text-indigo-400' : ''}`}
              >
                <div className="truncate text-left w-full">{conv.summary || (conv.messages && conv.messages[0]?.content) || 'New Chat'}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <UserIcon size={16} />
              <span className="truncate w-24">{user.name || 'User'}</span>
            </div>
            <button onClick={onLogout} className="text-zinc-500 hover:text-zinc-300">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                  {msg.role === 'user' ? <UserIcon size={14} className="text-white" /> : <Bot size={14} className="text-zinc-300" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-x-auto ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Bot size={14} className="text-zinc-300" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
                    <div className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              placeholder="Message AI Assistant..."
              className="bg-zinc-900 border-zinc-700 h-12 rounded-xl px-4 focus-visible:ring-indigo-500 text-zinc-100"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-0 shrink-0"
              onClick={handleSend}
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600">AI can make mistakes. Consider verifying important information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
