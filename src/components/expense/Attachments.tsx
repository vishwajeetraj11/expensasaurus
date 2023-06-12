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

    return <div className='relative'>
        {onDelete && <button type='button' disabled={disabled} onClick={onDelete} className="z-[1] top-[-10px] flex items-center group transition-all duration-200 justify-center right-[-10px] hover:bg-red-600 absolute bg-white p-2 rounded-full border border-[#f4f4f4] h-[30px] w-[30px] cursor-pointer">
            <MdClose className="h-[12px]  group-hover:text-white" />
        </button>}
        {data?.href
            ? <img src={data?.href} className='h-[100px] w-[100px] object-cover opacity-90' alt='File' />
            : null}
        <Button onClick={onDownload} className='absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] p-2 bg-white rounded-full' variant='light' size='xs'><DownloadIcon className='h-[20px]' /></Button>
    </div>

}
export default Attachments