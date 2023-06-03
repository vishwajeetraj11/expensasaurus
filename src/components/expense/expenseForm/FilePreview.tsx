import { FileWPreview } from 'expensasaures/shared/types/common';
import Image from 'next/image';
import React from 'react';
import { FcFile } from 'react-icons/fc';
import { MdClose } from 'react-icons/md';

interface Props {
    file: FileWPreview;
    setFiles: React.Dispatch<React.SetStateAction<FileWPreview[]>>;
}

export const ImageFilePreview = (props: Props) => {
    const { file, setFiles } = props;
    return (
        <div className="p-3 box-shadow-card relative">
            <span onClick={() => {
                setFiles(files => files.filter(f => f.preview !== file.preview))
            }} className="top-[-10px] flex items-center group transition-all duration-200 justify-center right-[-10px] hover:bg-red-600 absolute bg-white p-2 rounded-full border border-[#f4f4f4] h-[30px] w-[30px] cursor-pointer">
                <MdClose className="h-[12px]  group-hover:text-white" />
            </span>
            {file.preview && <Image src={file.preview} height={100} width={100} className="w-[100px] h-[100px] object-cover" alt={file?.file?.name} />}
        </div>
    )
}


export const FIlePreview = (props: Props) => {
    const { file, setFiles } = props;

    return <div>
        <div className="h-[100px] w-[100px] flex relative p-3 box-shadow-card">
            <span onClick={() => {
                setFiles(files => files.filter(f => f.file.name !== file.file.name))
            }} className="top-[-10px] flex items-center group transition-all duration-200 justify-center right-[-10px] hover:bg-red-600 absolute bg-white p-2 rounded-full border border-[#f4f4f4] h-[30px] w-[30px] cursor-pointer">
                <MdClose className="h-[12px] group-hover:text-white" />
            </span>
            <div className="bg-slate-400 flex flex-1">
                <FcFile className="self-center flex flex-1" />
            </div>
        </div>
        <p className="text-xs line-clamp-2 max-w-[100px] mt-2">{file?.file?.name}</p>
    </div>
}