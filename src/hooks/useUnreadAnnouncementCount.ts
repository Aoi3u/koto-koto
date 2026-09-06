import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Announcement } from '@/types/announcement';

export function useUnreadAnnouncementCount() {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    fetch('/api/announcements')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { announcements: Announcement[] } | null) => {
        if (cancelled || !data) return;
        setCount(data.announcements.filter((a) => !a.isRead).length);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status]);

  return status === 'authenticated' ? count : 0;
}
