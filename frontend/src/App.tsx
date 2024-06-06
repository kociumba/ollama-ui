import ChatUI from '@/components/chatui';
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect } from "react"
import hljs from "highlight.js";
import { useAutoAnimate } from '@formkit/auto-animate/react';

function App() {
    const [parent] = useAutoAnimate(); // Remove the enableAnimations function since we don't need to toggle animations
    // const [count, setCount] = useState(0);

    useEffect(() => {
        hljs.highlightAll();
    }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="min-h-screen grid place-items-center mx-auto py-8 bg-transparent">
                <div className="text-2xl font-bold flex flex-col items-center space-y-4">
                    {/* <h1>ollama ui</h1> */}
                    {/* <Button onClick={() => getResponse()}>Get response</Button> */}
                    {/* <Button onClick={() => console.log(ollama.list())}>list models</Button> */}
                    <div ref={parent} className="text-2xl font-bold flex flex-col items-center space-y-4">
                        <ChatUI />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default App
