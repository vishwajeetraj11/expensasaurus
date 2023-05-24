const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
];

export const timeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const interval =
        seconds === 0
            ? intervals[5]
            : intervals.find((i) => {
                return i.seconds < seconds;
            });
    if (interval) {
        const count = Math.floor(seconds / interval.seconds);
        if (count) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
        return 'just now';
    }
    return '';
};