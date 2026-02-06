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
import ExpenseList from "expensasaurus/components/calender/ExpenseList";
import Layout from "expensasaurus/components/layout/Layout";
import { useCalender } from "expensasaurus/hooks/useCalender";
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
        <title>Expensasaurus - View Expenses by Date on the Calendar</title>
      </Head>
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-16">
        <div className="mx-auto px-4 sm:px-7 md:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-slate-900/75 md:grid md:grid-cols-[392px_1fr] md:divide-x md:divide-slate-200 dark:md:divide-white/10 md:p-7">
            <div className="md:max-w-md md:pr-14">
              <div className="flex items-center">
                <h2 className="flex-auto font-semibold text-slate-900 dark:text-slate-100">
                  {format(firstDayCurrentMonth, "MMMM yyyy")}
                </h2>
                <button
                  type="button"
                  onClick={previousMonth}
                  className="-my-1.5 flex flex-none items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
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
                  className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <span className="sr-only">Next month</span>
                  <MdOutlineChevronRight
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-slate-500 dark:text-slate-300">
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
                        isEqual(day, selectedDay) &&
                          "bg-blue-600 text-white ring-2 ring-blue-200/70 dark:bg-blue-500 dark:ring-blue-300/40",
                        !isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "text-rose-500 dark:text-rose-300",
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-900 dark:text-slate-100",
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-400 dark:text-slate-500",
                        !isEqual(day, selectedDay) &&
                          "hover:bg-slate-100 dark:hover:bg-white/10",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-full transition"
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
                        <div className="h-1 w-1 rounded-full bg-blue-500">
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
