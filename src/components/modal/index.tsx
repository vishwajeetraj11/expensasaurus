import { Dialog } from "@headlessui/react";

import { Transition } from "@headlessui/react";
import { clsx } from "expensasaurus/shared/utils/common";
import { Fragment } from "react";

interface EModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryCtaText: string;
  secondaryCtaText?: string;
  action: "delete";
  onAction: () => void;
}

const EModal = (props: EModalProps) => {
  const {
    isOpen,
    onClose,
    primaryCtaText,
    description,
    title,
    action,
    secondaryCtaText,
    onAction,
  } = props;
  const isActionDelete = action === "delete";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] dark:bg-slate-950/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left align-middle shadow-2xl transition-all dark:border-white/10 dark:bg-slate-900">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 tracking-tight text-slate-900 dark:text-slate-100"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm font-normal leading-6 text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/15 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={onClose}
                  >
                    {secondaryCtaText || "Cancel"}
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-rose-500/30",
                      isActionDelete
                        ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/35 dark:bg-blue-500/15 dark:text-blue-200 dark:hover:bg-blue-500/25"
                    )}
                    onClick={onAction}
                  >
                    {primaryCtaText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EModal;
