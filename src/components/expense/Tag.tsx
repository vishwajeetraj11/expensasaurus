
interface TagProps {
    text: string;
}

const Tag = ({ text }: TagProps) => (
    <p className="py-1 px-2 bg-gray-100 rounded shadow-light font-medium text-gray-700 w-min whitespace-nowrap text-xs my-2">{text}</p>
);

export default Tag;