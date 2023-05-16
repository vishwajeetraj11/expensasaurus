export const clsx = (...classNames: any[]) => classNames.filter(Boolean).join(" ")

export const canUseDOM = (): boolean => {
    return !!(
        typeof window !== 'undefined' &&
        window.document &&
        window.document.createElement
    );
};

export const isBrowser = canUseDOM();


export function getPathUrl() {
    return window.parent.location.href.replace(/.*\/\/[^\/]*/, '');
}
