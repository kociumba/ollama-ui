import { SVGProps, useEffect, useState, useRef } from 'react';
import { Marked } from 'marked'
import 'highlight.js/styles/github-dark-dimmed.min.css';
import hljs from 'highlight.js';
import { markedHighlight } from "marked-highlight";
// import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    // CardContent,
    // CardDescription,
    // CardFooter,
    // CardHeader,
    // CardTitle,
} from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { GetResponse } from "../../wailsjs/go/main/App";
import { JSX } from 'react/jsx-runtime';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const ChatUI = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [parent] = useAutoAnimate();

    const handleSend = async () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            setInput('');
            setIsLoading(true);

            const response = await GetResponse(input);
            setMessages([...messages, { text: input, sender: 'user' }, { text: response, sender: 'ai' }]);
            setIsLoading(false);
        }
    };

    const marked = new Marked(
        markedHighlight({
            langPrefix: 'language-',
            highlight(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        })
    );

    const aiResponseRef = useRef(null);

    useEffect(() => {
        if (aiResponseRef.current) {
            const rawHTML = aiResponseRef.current;
            console.log('Raw HTML:', rawHTML);
        }
    }, []);

    const messagesEndRef = useRef<null | HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
      }, [messages]);

    return (
        <div ref={parent} className="p-10" style={{ height: '100%' }}>
            <div className="p-4">
                <div className="messages-container overflow-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                key={index}
                                className={`m-4 rounded-[20px] p-3 ${msg.sender === 'user' ? 'bg-white text-black self-end user-message' : 'bg-black self-start ai-response'}`}
                            >
                                {/* eslint-disable-next-line no-console */}
                                <div id={msg.sender === 'user' ? 'user-message' : 'ai-response'} ref={aiResponseRef} dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                                {/* <Markdown
                                    options={{
                                        overrides: {
                                            code: {
                                                component: SyntaxHighlightedCode,
                                            },
                                        },
                                    }}
                                >
                                    {msg.text}
                                </Markdown> */}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <Card className="bg-black text-white self-start rounded-[20px] p-3 mb-4 w-[297px] h-[497px]">
                                {/* <div className="loader">Loading...</div> Add a loader component or CSS animation */}
                                <Skeleton className="w-[300px] h-[500px]" />
                            </Card>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div >
                <div className="flex items-center mt-4">
                    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-3/4">
                        <Textarea
                            placeholder="Ask AI..."
                            className="resize-none bg-white text-black pl-4 pr-10 shadow-2xl shadow-black"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 text-black bg-transparent">
                            <PlaneIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatUI;

function PlaneIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
    )
}