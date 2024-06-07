import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { JSX } from 'react/jsx-runtime';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ListModels } from '../../wailsjs/go/main/App';

const Sidebar = (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className='sidebar-container'
            {...props}
        >
            <div className='min-h-screen sidebar'>
                <Card className="min-h-screen rounded-none bg-zinc-900 border-none">
                    <div className="text-2xl ml-1/4 space-y-4">
                        <p className='font-semibold p-4'>Ollama UI</p>
                        <ModelDialiog />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Sidebar;


const ModelDialiog = () => {
    const [modelList, setModelList] = useState<string[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const fetchedModels = await ListModels();
                setModelList(fetchedModels.slice(1));
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);

    return (
        <Dialog>
            <DialogTrigger>
                Models
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Model Settings</DialogTitle>
                    <DialogDescription>
                        <div className='pb-4'>Models installed</div>
                        <ul className='list-decimal pl-3'>
                            {modelList.map((model, index) => (
                                <button>
                                <li key={index}>{model}</li>
                                </button>
                            ))}
                        </ul>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export { ModelDialiog }