"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
    slug: string;
    initialViews?: number;
}

export function ViewCounter({ slug, initialViews = 0 }: ViewCounterProps) {
    const [views, setViews] = useState(initialViews);

    useEffect(() => {
        const incrementViews = async () => {
            try {
                const res = await fetch("/api/views", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ slug }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.views) {
                        setViews(data.views);
                    }
                }
            } catch (error) {
                console.error("Failed to increment views", error);
            }
        };

        // Call immediately on mount
        incrementViews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    return (
        <span className="text-sm text-muted-foreground ml-2">
            {views > 0 ? `${views} Views` : ""}
        </span>
    );
}
