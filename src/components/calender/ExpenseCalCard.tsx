import { formatDistance } from "date-fns";

function ExpenseCalCard({
  meeting,
}: {
  meeting: {
    title: string;
    description: string;
    amount: number;
    category: string;
    tag: string;
    date: string;
    currency: string;
  };
}) {
  let createdDate = new Date(meeting.date);
  const now = new Date();
  const formattedDate = formatDistance(createdDate, now);
  return (
    <li className="flex items-center rounded-xl focus-within:bg-gray-100 hover:bg-gray-100 relative">
      {/* Icon of category */}
      <div>
        <div className=""></div>
        <div className="py-2">
          <p className="text-stone-700 font-semibold text-md px-4">
            {meeting.title}
          </p>
          <p className="text-stone-600 font-medium px-4">
            {meeting.description}
          </p>
        </div>
        <p>{formattedDate} ago</p>
      </div>
    </li>
  );
}

export default ExpenseCalCard;
