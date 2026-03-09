import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
}

export default function AnimatedCounter({ end, duration = 1800, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !started.current) {
                    started.current = true;
                    const startTime = performance.now();
                    const step = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end * Math.pow(10, decimals)) / Math.pow(10, decimals));
                        if (progress < 1) requestAnimationFrame(step);
                        else setCount(end);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration, decimals]);

    const formatted = decimals > 0
        ? count.toFixed(decimals)
        : count >= 1000000
            ? `${(count / 1000000).toFixed(1)}M`
            : count >= 1000
                ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
                : String(Math.round(count));

    return (
        <span ref={ref}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
