import clsx from "clsx";
import {
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import ExpenseList from "expensasaures/components/calender/ExpenseList";
import Layout from "expensasaures/components/layout/Layout";
import { useCalender } from "expensasaures/hooks/useCalender";
import Head from "next/head";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

const Calender = () => {
  const {
    firstDayCurrentMonth,
    previousMonth,
    nextMonth,
    days,
    setSelectedDay,
    selectedDay,
    thisMonthExpenses,
  } = useCalender();

  return (
    <Layout>
      <Head>
        <title>Expensasaures - View Expenses by Date on the Calendar</title>
      </Head>
      <div className="pt-16 px-4 max-w-[1200px] mx-auto w-full">
        <div className="px-4 mx-auto sm:px-7 md:px-6">
          <div className="md:grid md:grid-cols-[392px_1fr] md:divide-x md:divide-gray-200">
            <div className="md:pr-14 md:max-w-md">
              <div className="flex items-center">
                <h2 className="flex-auto font-semibold dark:text-slate-300 text-gray-900">
                  {format(firstDayCurrentMonth, "MMMM yyyy")}
                </h2>
                <button
                  type="button"
                  onClick={previousMonth}
                  className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Previous month</span>
                  <MdOutlineChevronLeft
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                </button>
                <button
                  onClick={nextMonth}
                  type="button"
                  className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Next month</span>
                  <MdOutlineChevronRight
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500 dark:text-white">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              {/* Mapped Days */}
              <div className="grid grid-cols-7 mt-2 text-sm">
                {days.map((day, dayIdx) => (
                  <div
                    key={day.toString()}
                    className={clsx(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      "py-1.5"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(day);
                      }}
                      className={clsx(
                        isEqual(day, selectedDay) && "text-white",
                        !isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "text-red-500",
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-900",
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-400",
                        isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-red-500",
                        isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-gray-900",
                        !isEqual(day, selectedDay) && "hover:bg-gray-200 dark:hover:bg-slate-600",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                        "mx-auto flex h-8 w-8 items-center justify-center dark:text-white rounded-full"
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>

                    <div className="w-1 h-1 mx-auto mt-1">
                      {thisMonthExpenses?.documents?.some((expense) => {

                        return isSameDay(parseISO(expense.date), day);
                      }) && (
                          <div className="w-1 h-1 rounded-full bg-blue-500">
                            &nbsp;
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <section className="mt-12 md:mt-0 md:pl-14">
              <ExpenseList selectedDay={selectedDay} />
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export default Calender;
