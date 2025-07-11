import { formatDateTime } from '@/utils/date';
import { useEffect, useState } from 'react';

function HeaderDatetime() {
  const [time, setTime] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(Number(new Date()));
    
    const timer = setInterval(() => {
      setTime(Number(new Date()));
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted || time === null) {
    return <h1 className="text-center font-DDin text-2xl font-bold">Loading...</h1>;
  }

  return <h1 className="text-center font-DDin text-2xl font-bold">{formatDateTime(time)}</h1>;
}
export default HeaderDatetime;
