"use client";

import { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TocItem } from "@/lib/toc";

interface TableOfContentsProps {
    items: TocItem[];
    className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -80% 0px" }
        );

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    const renderItems = (isMobile: boolean) => (
        <ul className={cn("space-y-2", isMobile ? "mt-4" : "")}>
            {items.map((item) => (
                <li
                    key={item.id}
                    style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
                    className="leading-tight"
                >
                    <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                            if (isMobile) setIsMobileOpen(false);
                        }}
                        className={cn(
                            "block py-1 text-sm transition-colors hover:text-primary",
                            activeId === item.id
                                ? "font-bold text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {item.text}
                    </a>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={cn("w-full", className)}>
            {/* Desktop View */}
            <div className="hidden lg:block rounded-xl border border-border/40 bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center space-x-2 border-b border-border/40 pb-3">
                    <List className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">目次</h2>
                </div>
                <nav>{renderItems(false)}</nav>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold transition-colors hover:bg-muted/50"
                >
                    <div className="flex items-center space-x-2">
                        <List className="h-5 w-5 text-primary" />
                        <span>目次</span>
                    </div>
                    {isMobileOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </button>
                <div
                    className={cn(
                        "px-4 pb-4 transition-all duration-300 ease-in-out",
                        isMobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}
                >
                    <nav className="border-t border-border/40 pt-2">{renderItems(true)}</nav>
                </div>
            </div>
        </div>
    );
}
