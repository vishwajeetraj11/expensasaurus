import { DownloadIcon } from '@heroicons/react/outline';
import { Button, Text } from '@tremor/react';
import { Models } from 'appwrite';
import { ENVS } from 'expensasaurus/shared/constants/constants';
import { storage } from 'expensasaurus/shared/services/appwrite';
import { useAuthStore } from 'expensasaurus/shared/stores/useAuthStore';
import { Fragment } from 'react';
import { MdClose } from 'react-icons/md';
import { useQueries } from 'react-query';
import { shallow } from 'zustand/shallow';

interface AttachmentsProps {
    ids: string[]
}

const Attachments = (props: AttachmentsProps) => {
    const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
        user: Models.Session;
    };
    const { ids } = props;
    const filePreviews = useQueries(ids.map(id => ({
        queryKey: ['get-file-preview', id, user.userId],
        queryFn: async () => {
            return storage.getFilePreview(ENVS.BUCKET_ID, id);
        },
        enabled: !!user
    })));

    return (
        <>
            <Text className="mt-4">Attachments</Text>
            <div className="flex mt-4 flex-wrap gap-4">
                {filePreviews?.map((filePreview, index) => {
                    const { data } = filePreview;
                    if (!data) return <Fragment key={index} />
                    return <Attachment data={data} key={index} />;
                })}
            </div>
        </>
    );
};

interface AttachmentProps {
    data: URL | undefined,
    onDelete?: () => void
    disabled?: boolean
}

export const Attachment = (props: AttachmentProps) => {
    const { data, onDelete, disabled = false } = props;
    const fileId = new URL(data?.href || '').pathname.split('/')[6];

    const onDownload = () => {
        const file = storage.getFileDownload(ENVS.BUCKET_ID, fileId);
        window.open(file, '_blank');
    }

    return <div className='relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/70'>
        {onDelete && <button type='button' disabled={disabled} onClick={onDelete} className="group absolute right-[-10px] top-[-10px] z-[1] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 transition-all duration-200 hover:border-rose-400 hover:bg-rose-500 dark:border-white/15 dark:bg-slate-900 dark:hover:border-rose-500/60 dark:hover:bg-rose-500">
            <MdClose className="h-[12px] text-slate-600 group-hover:text-white dark:text-slate-300" />
        </button>}
        {data?.href
            ? <img src={data?.href} className='h-[100px] w-[100px] rounded-md object-cover opacity-90' alt='File' />
            : null}
        <Button onClick={onDownload} className='absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] rounded-full bg-white p-2 dark:bg-slate-800/90' variant='light' size='xs'><DownloadIcon className='h-[20px]' /></Button>
    </div>

}
export default Attachments
