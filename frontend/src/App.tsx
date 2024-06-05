import { Button } from "@/components/ui/button"
// import React from "react"
import ollama from "ollama/browser";

async function getResponse() {

    const response = await ollama.generate({
        model: 'dolphincoder',
        prompt: "what is a header file",
        stream: false
    });

    console.log(response);
}


function App() {
//   const [count, setCount] = React.useState(0)

  return (
    <div className="min-h-screen bg-white grid place-items-center mx-auto py-8">
      <div className="text-blue-900 text-2xl font-bold flex flex-col items-center space-y-4">
        <h1>ollama ui</h1>
        <Button onClick={() => getResponse()}>Get response</Button>
        <Button onClick={() => console.log(ollama.list())}>list models</Button>
      </div>
    </div>
  )
}

export default App
