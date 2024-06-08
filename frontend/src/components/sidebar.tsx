import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
// import { JSX } from 'react/jsx-runtime';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ListModels, SetModel, PullModelStream, CurrentModel, ReturnProgress } from '../../wailsjs/go/main/App';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MainView } from '../App'
// import { Button } from "@/components/ui/button"
import { Input } from './ui/input';
import { Progress } from "@/components/ui/progress";


interface SelectProps {
    modelList: string[];
}

type SetMainView = (view: MainView) => void;

interface SidebarProps {
    setCurrentMain: SetMainView;
}


const Sidebar: React.FC<SidebarProps> = ({ setCurrentMain, ...props }) => {
    return (
        <div
            className='sidebar-container flex h-full items-left justify-left p-6 bg-zinc-900'
            {...props}
        >
            <div className='min-h-screen sidebar'>
                <Card className="min-h-screen rounded-none bg-zinc-900 border-none">
                    <div className="text-2xl ml-1/4 space-y-4 flex flex-col">
                        <div className='flex flex-row'>
                            {/* <img src={'frontend/src/assets/appicon.png'} alt="Logo"></img> */}
                            <div className='font-semibold p-4'>Ollama UI</div>
                        </div>
                        <button onMouseDown={() => setCurrentMain(MainView.ChatUI)}>
                            <div className='p-4 dialog transition-all w-fit'>Chat</div>
                        </button>
                        <ModelDialog />
                        {/* <Button onMouseDown={() => setCurrentMain(MainView.ChatUI)}>ChatUI</Button>
                        <Button onMouseDown={() => setCurrentMain(MainView.ModelBrowse)}>ModelBrowse</Button> */}
                        {/* <button onMouseDown={() => setCurrentMain(MainView.ModelBrowse)}> */}
                        {/* <button>
                            <div className='p-4 dialog transition-all w-fit'>Pull Model</div>
                        </button> */}
                        <PullModelDialog />
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
                    setTimeout(() => {
                        setModelList(fetchedModels.filter(model => model !== ''));
                        console.log('Models fetched:', modelList);
                    }, 1000);
                    if (modelList.length <= 0) {
                        console.error('Error fetched models:', fetchedModels);
                    }
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
            <DialogTrigger style={{ display: 'flex' }}>
                <a className='p-4 dialog transition-all'>Select Models</a>
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
    console.log('ModelList:', modelList);
    const [value, setValue] = useState('');

    if (!Array.isArray(modelList)) {
        console.error("modelList is not an array:", modelList);
        return null; // or some fallback UI
    }

    async function SetModelWithCheck(value: string) {
        if (value == await CurrentModel()) {
            return
        } else if (value == 'default') {
            SetModel(await CurrentModel());
        } else {
            SetModel(value);
        }
        return
    }

    useEffect(() => {
        CurrentModel().then((model) => {
            setValue(model);
            console.info('Current model:', model);
        }).catch((error) => {
            console.error('Error fetching current model:', error);
        });
    }, []);

    return (
        <Select onValueChange={(value) => SetModelWithCheck(value)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue
                    // placeholder={modelList.includes(value) ? value : ''}
                    defaultValue={value}
                />
            </SelectTrigger>
            <SelectContent>
                {modelList.map((model) => (
                    <SelectItem key={model} value={model && model !== '' ? model : 'default'}>
                        {model}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function PullModelDialog() {
    const [modelStatus, setModelStatus] = useState<Array<string>>(Array<string>()); // 'unknown');
    const [progress, setProgress] = useState<number>();

    useEffect(() => {
        let isMounted = true;  // Add a flag to handle component unmounting

        const checkProgress = async () => {
            console.info('Starting progress check...');
            while (isMounted && modelStatus[0] === 'loading') {
                // console.info('Checking progress...');
                let pullProgress = await ReturnProgress();
                const percentProgress = pullProgress[1] === 0 ? 0 : Math.round((pullProgress[0] / pullProgress[1]) * 100);
                setProgress(percentProgress);
                // console.info('Pull progress percent:', percentProgress);

                // Re-fetch the model status to check if it has changed
                await new Promise(res => setTimeout(res, 200));  // Add a small delay to prevent rapid polling
            }
            console.log('Exited loop with model status:', modelStatus[0]);
        };

        if (modelStatus[0] === 'loading') {
            checkProgress();
        }

        return () => {
            isMounted = false;  // Cleanup function to handle component unmounting
        };
    }, [modelStatus]);

    return (
        <Dialog onOpenChange={() => setModelStatus(['', ''])}>
            <DialogTrigger style={{ display: 'flex' }}>
                <a className='p-4 dialog transition-all'>Pull Models</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pull a model by name</DialogTitle>
                    <DialogDescription>
                        <div className='pb-4'>Model name:</div>
                        <div className='relative'>
                            <Input
                                placeholder="Enter model name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setModelStatus(['loading', '']);
                                        PullModelStream(e.currentTarget.value)
                                            .then(result => setModelStatus(result))
                                            .catch(() => setModelStatus(['', 'error']));
                                    }
                                }}
                            />
                            {modelStatus[0] === 'loading' && (
                                <div className='absolute inset-y-0 right-4 flex bottom-4 items-center pointer-events-none'>
                                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                            {modelStatus[0] === 'loading' && (
                                // <div className={`transition-opacity duration-150 ${progress ? 'opacity-100' : 'opacity-0'}`}>
                                <Progress value={progress} className='top-4 transition-all' />
                                // </div>
                            )}
                            {modelStatus[0] === "success" && <div className='pt-4 text-green-400'>{modelStatus[1]}</div>}
                            {modelStatus[0] === "" && <div className='pt-4 text-red-400'>{modelStatus[1]}</div>}
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}