import { FileWPreview } from 'expensasaurus/shared/types/common';
import Image from 'next/image';
import React from 'react';
import { useForm, useFormState } from 'react-final-form';
import { FcFile } from 'react-icons/fc';
import { MdClose } from 'react-icons/md';

interface Props {
    file: FileWPreview;
    setFiles: React.Dispatch<React.SetStateAction<FileWPreview[]>>;
    disabled?: boolean;
}

export const ImageFilePreview = (props: Props) => {
    const { file, setFiles, disabled = false } = props;
    const form = useForm()
    const formState = useFormState()
    const attachements = formState.values.attachments
    return (
        <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <button type='button' disabled={disabled} onClick={() => {
                setFiles(files => files.filter(f => f.preview !== file.preview));
                form.mutators.setFieldValue('attachments', attachements.filter((f: File) => f.name !== file.file.name))
            }} className="group absolute right-[-10px] top-[-10px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 transition-all duration-200 hover:border-rose-400 hover:bg-rose-500 dark:border-white/15 dark:bg-slate-900 dark:hover:border-rose-500/60 dark:hover:bg-rose-500">
                <MdClose className="h-[12px] text-slate-600 group-hover:text-white dark:text-slate-300" />
            </button>
            {file.preview && <Image src={file.preview} height={100} width={100} className="w-[100px] h-[100px] object-cover" alt={file?.file?.name} />}
        </div>
    )
}


export const FIlePreview = (props: Props) => {
    const { file, setFiles, disabled = false } = props;
    const form = useForm()
    const formState = useFormState()
    const attachements = formState.values.attachments
    return <div>
        <div className="relative flex h-[100px] w-[100px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <button disabled={disabled} onClick={() => {
                setFiles(files => files.filter(f => f.file.name !== file.file.name));
                form.mutators.setFieldValue('attachments', attachements.filter((f: File) => f.name !== file.file.name))

            }} className="group absolute right-[-10px] top-[-10px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 transition-all duration-200 hover:border-rose-400 hover:bg-rose-500 dark:border-white/15 dark:bg-slate-900 dark:hover:border-rose-500/60 dark:hover:bg-rose-500">
                <MdClose className="h-[12px] text-slate-600 group-hover:text-white dark:text-slate-300" />
            </button>
            <div className="flex flex-1 rounded-md bg-slate-200 dark:bg-slate-800">
                <FcFile className="self-center flex flex-1" />
            </div>
        </div>
        <p className="mt-2 max-w-[100px] line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{file?.file?.name}</p>
    </div>
}
