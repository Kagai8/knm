import { useEffect, useState } from 'react';

/**
 * Live total of unread messages across the user's conversations.
 * Powers the sidebar badge. Polls every 15s, pauses on hidden tabs.
 */
export function useMessageUnread(enabled: boolean, intervalMs = 15000): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!enabled) return;

        const tick = async () => {
            if (document.hidden) return;
            try {
                const res = await fetch('/private/conversations/unread-count', {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                setCount(data.count ?? 0);
            } catch {
                // silent — retry next tick
            }
        };

        tick();
        const interval = setInterval(tick, intervalMs);
        return () => clearInterval(interval);
    }, [enabled, intervalMs]);

    return count;
}
