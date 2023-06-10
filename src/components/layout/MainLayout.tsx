import { useAuthStore } from "expensasaures/shared/stores/useAuthStore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";

interface Props {
    children: React.ReactNode;
}

const MainLayout = (props: Props) => {
    const { children, } = props;
    const { user, getUser } = useAuthStore(
        (store) => ({ user: store.user, getUser: store.getUser }),
        shallow
    );

    const router = useRouter();

    useEffect(() => {
        (async function () {
            if (!user) {
                const userAfterFetch = await getUser();
                if (!userAfterFetch) {
                    router.push('/login')
                }
            } else {
                router.push('/dashboard')
            }
        })();
    }, [user]);

    return (
        <>{children}</>
    )
}

export default MainLayout