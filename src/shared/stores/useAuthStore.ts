import { Models } from 'appwrite'
import { create } from 'zustand'
import { account } from '../services/appwrite'
import { authFormStateType } from '../types/auth'

type useAuthStoreType = {
    authFormState: authFormStateType,
    setAuthFormState: (state: authFormStateType) => void,
    user: Models.Session | null,
    setUser: (user: Models.Session | null) => void,
    getUser: () => Promise<Models.Session | undefined>
    userInfo: Models.User<Models.Preferences> | null,
    setUserInfo: (user: Models.User<Models.Preferences> | null) => void,
    getUserInfo: () => Promise<void>
}

const useAuthStore = create<useAuthStoreType>((set, get) => ({
    authFormState: 'SIGN_IN',
    setAuthFormState: (state) => set({ authFormState: state }),
    userInfo: null,
    user: null,
    setUser: (user) => set({ user }),
    setUserInfo: (userInfo) => set({ userInfo }),
    getUser: async () => {
        try {
            const { user } = get();
            if (user) {
                return user;
            } else {
                const sessionId = localStorage.getItem("sessionId");
                if (sessionId) {
                    const currentUser = await account.getSession(sessionId);
                    if (!currentUser) {
                        localStorage.removeItem("sessionId");
                        const currentUser = await account.getSession("current");
                        set({ user: currentUser });
                        return currentUser;
                    }
                    set({ user: currentUser });
                    return currentUser;
                }

            }
        } catch (e) {

        }
    },
    getUserInfo: async () => {
        try {
            const userInfo = await account.get();
            set({ userInfo });
        } catch (e) {

        }
    }
}))

export { useAuthStore }
