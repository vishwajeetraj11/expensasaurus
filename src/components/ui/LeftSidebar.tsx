import { useClickOutside } from 'expensasaures/hooks/useClickOutside';
import { clsx } from 'expensasaures/shared/utils/common';
import { RefObject, useEffect, useRef } from 'react';

interface Props {
    showMenu: boolean;
    onCloseMenu?: () => void;
    children: React.ReactNode
}

const LeftSidebar = (props: Props) => {
    const { showMenu, onCloseMenu, children } = props
    const ref = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>;
    let classes = clsx(
        'absolute lg:static inset-0 lg:pt-0 py-[100px] lg:px-0 overflow-y-auto px-4 transform duration-300 lg:relative lg:translate-x-0 bg-white flex flex-col flex-shrink-0 w-[280px] font-sans text-sm text-gray-700 border-r sm:border-0 border-gray-100 lg:shadow-none justify-items-start',
        !showMenu && '-translate-x-full ease-out shadow-none',
        showMenu && 'translate-x-0 ease-in shadow-xl',
    );
    let ready = false;
    useClickOutside(ref, () => {
        if (ready && showMenu && onCloseMenu) onCloseMenu();
    })
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setTimeout(() => (ready = true), 300);
    });

    return (
        <div className={classes} style={{ zIndex: 2 }} ref={ref}>
            {children}
        </div>
    )
}

export default LeftSidebar