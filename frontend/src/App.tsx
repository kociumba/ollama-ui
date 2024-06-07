import ChatUI from '@/components/chatui';
import Sidebar from '@/components/sidebar';
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect } from "react"
import hljs from "highlight.js";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"


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

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel minSize={20} maxSize={20} defaultSize={20}>
                    <Sidebar 
                    // className='flex h-full items-center justify-center p-6 bg-zinc-900' 
                    className='flex h-full items-left justify-left p-6 bg-zinc-900'
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80}>
                    <div className="min-h-screen grid place-items-center mx-auto py-8 bg-transparent">
                        <div className="text-2xl flex flex-col items-center space-y-4">
                            <div ref={parent} className="text-2xl flex flex-col items-center space-y-4">
                                <ChatUI />
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

        </ThemeProvider>
    )
}

export default App
