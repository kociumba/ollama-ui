import ChatUI from '@/components/chatui';
import Sidebar from '@/components/sidebar';
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState, useMemo } from "react"
import hljs from "highlight.js";
// import { useAutoAnimate } from '@formkit/auto-animate/react';
// import autoAnimate from '@formkit/auto-animate';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
// import { Button } from "@/components/ui/button"

export enum MainView {  // <-- Ensure MainView is exported
    ChatUI = 'ChatUI',
    ModelBrowse = 'ModelBrowse',
}

function App() {
    // const [parent] = useAutoAnimate({});
    // const [count, setCount] = useState(0);
    const [currentMain, setCurrentMain] = useState<MainView>(MainView.ChatUI);

    const renderComponent = useMemo(() => {
        if (currentMain === MainView.ChatUI) {
            return <ChatUI key="ChatUI" />;
        } else if (currentMain === MainView.ModelBrowse) {
            return ;
        } else {
            return null;
        }
    }, [currentMain]);

    useEffect(() => {
        hljs.highlightAll();
    }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel minSize={20} maxSize={20} defaultSize={20}>
                    <Sidebar
                        // className='flex h-full items-center justify-center p-6 bg-zinc-900' 
                        setCurrentMain={(view: MainView) => setCurrentMain(view)}
                    // className='flex h-full items-left justify-left p-6 bg-zinc-900'
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80}>
                    <div className="min-h-screen grid place-items-center mx-auto py-8 bg-transparent">
                        <div className="text-2xl flex flex-col items-center space-y-4">
                            {/* <div ref={parent} className="text-2xl flex flex-col items-center space-y-4"> */}
                            <div className="text-2xl flex flex-col items-center space-y-4">
                                {/* <ChatUI className={currentMain === MainView.ChatUI ? 'opacity-100' : 'opacity-0'} />
                                <ModelBrowse className={currentMain === MainView.ModelBrowse ? 'opacity-100' : 'opacity-0'} /> */}
                                {renderComponent}
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

        </ThemeProvider >
    )
}

export default App
