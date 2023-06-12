import { Dialog } from "@headlessui/react";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";

import { Transition } from "@headlessui/react";
import { Fragment } from "react";

import { useLocaleStore } from "expensasaurus/shared/stores/useLocaleStore";
import CurrencyForm from "./profile/currencyForm";

const CurrencyModal = () => {
  const { userInfo } = useAuthStore(
    (store) => ({
      userInfo: store.userInfo,
    }),
    shallow
  );

  const { getCurrencies } = useLocaleStore((state) => ({
    currencies: state.currencies,
    getCurrencies: state.getCurrencies,
  }));

  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    if (userInfo) {
      const currency = userInfo.prefs.currency;
      if (!currency) {
        setIsOpen(true);
        getCurrencies();
      }
    }
  }, [getCurrencies, userInfo]);

  const onClose = () => {
    setIsOpen(false);
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                ></Dialog.Title>

                <CurrencyForm onClose={onClose} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CurrencyModal;
