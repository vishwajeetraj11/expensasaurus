import { currentMonthIndex } from 'expensasaurus/hooks/useDates';
import { create } from 'zustand';
import { monthNames } from '../constants/constants';

type useGlobalStoreType = {
    activeMonth: string;
    setActiveMonth: (month: string) => void;
}

const useGlobalStore = create<useGlobalStoreType>((set, get) => ({
    activeMonth: monthNames[currentMonthIndex],
    setActiveMonth: (month) => set({ activeMonth: month }),
}))

export { useGlobalStore };


