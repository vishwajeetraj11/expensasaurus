import { Models } from 'appwrite';
import { create } from 'zustand';
import { locale } from '../services/appwrite';
import { authFormStateType } from '../types/auth';

type useLocaleStoreType = {
    authFormState: authFormStateType;
    setAuthFormState: (authFormState: authFormStateType) => void;
    currencies: Models.CurrencyList | null;
    getCurrencies: () => Promise<Models.CurrencyList | undefined>;
}

const useLocaleStore = create<useLocaleStoreType>((set, get) => ({
    authFormState: 'SIGN_IN',
    setAuthFormState: (authFormState) => set({ authFormState }),
    currencies: null,
    getCurrencies: async () => {
        try {
            const { currencies } = get();
            if (currencies) {
                return currencies;
            } else {
                const currencies = await locale.listCurrencies()
                set({ currencies });
                return currencies;
            }
        } catch (e) {
            console.log(e);
        }
    }
}))

export { useLocaleStore };

