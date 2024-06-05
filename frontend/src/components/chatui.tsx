import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GetResponse } from "../../wailsjs/go/main/App";

const ChatUI = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

    return (
        <Card>
            <CardHeader>ollama ui</CardHeader>
            <CardContent>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                    <Input
                        value={input}
                        onInput={e => setInput((e.target as HTMLInputElement).value)}
                        onKeyUp={e => e.key === 'Enter' && GetResponse(input).then(response => setResponse(response))} />
                </CardDescription>
            </CardContent>
            <ScrollArea>{response}</ScrollArea>
        </Card>
    );
};

export default ChatUI;