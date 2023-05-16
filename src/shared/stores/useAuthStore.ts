import { create } from 'zustand'
import { authFormStateType } from '../types/auth'

type useAuthStoreType = {
    authFormState: authFormStateType,
    setAuthFormState: (state: authFormStateType) => void
}

const useAuthStore = create<useAuthStoreType>((set) => ({
    authFormState: 'SIGN_IN',
    setAuthFormState: (state) => set({ authFormState: state })
}))

export { useAuthStore }