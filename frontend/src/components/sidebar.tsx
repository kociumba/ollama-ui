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
import { ListModels, SetModel } from '../../wailsjs/go/main/App';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


interface SelectProps {
    modelList: string[];
}

const Sidebar = (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className='sidebar-container'
            {...props}
        >
            <div className='min-h-screen sidebar'>
                <Card className="min-h-screen rounded-none bg-zinc-900 border-none">
                    <div className="text-2xl ml-1/4 space-y-4">
                        <div className='font-semibold p-4'>Ollama UI</div>
                        <ModelDialog />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Sidebar;


const ModelDialog = () => {
    const [modelList, setModelList] = useState<string[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const fetchedModels = await ListModels();
                if (Array.isArray(fetchedModels)) {
                    // const updatedModels = fetchedModels.map(model => model ? model : 'default');
                    // setModelList(updatedModels);
                    // console.log('Fetched models:', updatedModels);
                    setModelList(fetchedModels.slice(1));
                } else {
                    console.error("Fetched models is not an array:", fetchedModels);
                }
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);
    return (
        <Dialog>
            <DialogTrigger>
                <a className='p-4 dialog transition-all'>Models</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Model Settings</DialogTitle>
                    <DialogDescription>
                        <div className='pb-4'>Models installed</div>
                        <SelectModel modelList={modelList} />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export { ModelDialog };

export function SelectModel({ modelList }: SelectProps) {

    if (!Array.isArray(modelList)) {
        console.error("modelList is not an array:", modelList);
        return null; // or some fallback UI
    }

    return (
        <Select onValueChange={(value) => SetModel(value)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                {modelList.map((model) => (
                    <SelectItem key={model} value={model}>
                        {model}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}