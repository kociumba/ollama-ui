import { Button } from "@/components/ui/button"
import ChatUI from '@/components/chatui';
import { ThemeProvider } from "@/components/theme-provider"

// // import React from "react"
// import ollama from "ollama/browser";
// import { GetResponse } from "../wailsjs/go/main/App";

// async function getResponse() {

//     const response = await GetResponse("what is a header file?")

//     console.log(response);
// }


function App() {
    //   const [count, setCount] = React.useState(0)

    return (
        <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen grid place-items-center mx-auto py-8 bg-transparent">
            <div className="text-blue-900 text-2xl font-bold flex flex-col items-center space-y-4">
                {/* <h1>ollama ui</h1> */}
                {/* <Button onClick={() => getResponse()}>Get response</Button> */}
                {/* <Button onClick={() => console.log(ollama.list())}>list models</Button> */}
                <ChatUI/>
            </div>
        </div>
        </ThemeProvider>
    )
}

export default App
