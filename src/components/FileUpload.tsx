
import { Models } from "appwrite";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { storage } from "expensasaurus/shared/services/appwrite";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { FileWPreview } from "expensasaurus/shared/types/common";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { getBase64, isUploadedFileImage } from "expensasaurus/shared/utils/file";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { useField, useForm, useFormState } from "react-final-form";
import { FcFile } from "react-icons/fc";
import { useQueries, useQueryClient } from "react-query";
import { useDropArea } from "react-use";
import { toast } from "sonner";
import { shallow } from "zustand/shallow";
import { Attachment } from "./expense/Attachments";
import { FIlePreview, ImageFilePreview } from "./expense/expenseForm/FilePreview";
import FormInputLabel from "./ui/FormInputLabel";

interface Props {

}

const FileUpload = (props: Props) => {

  const { user } = useAuthStore((state) => ({ user: state.user }), shallow) as {
    user: Models.Session;
  };

  const { submitting } = useFormState();
  const disabled = submitting

  const router = useRouter();
  const isUpdateRoute = router.route === "/expenses/[id]/edit";

  const { input } = useField("attachments");
  const form = useForm()
  const formState = useFormState()
  const attachements = formState.values.attachments;
  const [files, setFiles] = useState<FileWPreview[]>([]);

  const [bond, state] = useDropArea({
    onFiles: async (filesinput) => {
      const [file] = filesinput;

      const isSameFile = files.find((f) => f.file.name === file.name);

      if (isSameFile) {

        toast.error("File already available!");
        return;
      }
      const res = {} as FileWPreview;
      const maxSizeInBytes = 5 * 1024 * 1024
      if (disabled) return;
      if (file.size > maxSizeInBytes) {
        toast.error('File size is too large. Max size is 5MB')
        return;
      }
      if (input.value.length >= 5) {
        toast.error('Max number of attachments is 5')
        return;
      }
      if (isUploadedFileImage(file)) {
        const imagePreview = await getBase64(file) as string;
        res.preview = imagePreview;
      }
      res.file = file;
      // input.onChange(input.value.concat(file));
      form.mutators.setFieldValue('attachments', [...attachements, file])
      setFiles(files => files.concat(res));
    },
  });

  const queryClient = useQueryClient()

  const filePreviews = useQueries(input?.value?.filter((value: FileWPreview | string) => typeof value === 'string').map((id: string) => ({
    queryKey: ['get-file-preview', id, user.userId],
    queryFn: async () => {
      return storage.getFilePreview(ENVS.BUCKET_ID, id);
    },
    enabled: !!user
  })));

  const onDelete = async (id: string) => {
    try {
      await storage.deleteFile(ENVS.BUCKET_ID, id);
      input.onChange(input.value.filter((fileId: string) => fileId !== id));
      queryClient.setQueryData<Transaction | undefined>(
        ["Expenses by ID", id, user?.userId],
        (oldData) => {
          if (oldData) {
            const newData = JSON.parse(JSON.stringify(oldData)) as Transaction;
            if (newData.attachments && newData.attachments.length > 0) {
              newData.attachments = newData.attachments.filter((fileId: string) => fileId !== id);
            }
            return newData;
          }
          return undefined;
        }
      );
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Error deleting file')
    }
  }

  return (
    <div>

      <FormInputLabel htmlFor="cover-photo">
        Attachments
      </FormInputLabel>
      <div className="flex gap-4 my-4 empty:my-0">
        {files.map((file, index) => {
          return file.preview ? <ImageFilePreview disabled={disabled} file={file} setFiles={setFiles} key={index} /> : <FIlePreview file={file} disabled={disabled} setFiles={setFiles} key={index} />
        })}
        {isUpdateRoute && filePreviews?.map((filePreview, index) => {
          const { data } = filePreview;
          if (!data) return <Fragment key={index} />
          const result = data as unknown as URL
          const fileId = new URL(result?.href || '').pathname.split('/')[6];
          return <Attachment disabled={disabled} onDelete={() => onDelete(fileId)} data={data as unknown as URL} key={index} />;
        })}
      </div>
      <div {...bond} className="col-span-full mt-2">
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center flex items-center justify-center flex-col">
            <FcFile />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                />
              </label>
              <p className="pl-1">Upload file via drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
