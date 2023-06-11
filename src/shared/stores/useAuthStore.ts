import { Models } from 'appwrite'
import { NextRouter } from 'next/router'
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
    getUserInfo: () => Promise<void>;
    logout: (router: NextRouter) => Promise<void>;
}

const useAuthStore = create<useAuthStoreType>((set, get) => ({
    authFormState: 'SIGN_IN',
    setAuthFormState: (state) => set({ authFormState: state }),
    userInfo: null,
    user: null,
    setUser: (user) => set({ user }),
    setUserInfo: (userInfo) => set({ userInfo }),
    logout: async (router: NextRouter) => {
        try {
            const { user, setUser } = get();
            if (user) {
                await account.deleteSession(user.$id);
                localStorage.removeItem("sessionId");
                setUser(null);
                // router.push('/login')
            }
        } catch (e) { }
    },
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
                } else {
                    const currentUser = await account.getSession("current");
                    set({ user: currentUser });
                    return currentUser;
                }

            }
        } catch (e) {
            localStorage.removeItem("sessionId");
        }
    },
    getUserInfo: async () => {
        try {
            const { userInfo } = get();
            if (userInfo) return
            const userInfoAPI = await account.get();
            set({ userInfo: userInfoAPI });
        } catch (e) {

        }
    }
}))

export { useAuthStore }
