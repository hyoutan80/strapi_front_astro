"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Rocket, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
    { name: "Tech Exploration", href: "/blog/tech-exploration" },
    { name: "PM & Method", href: "/blog/pm-method" },
    { name: "Modern Workflow", href: "/blog/modern-workflow" },
    { name: "Culture & Hobby", href: "/blog/culture-hobby" },
    { name: "Log / Archive", href: "/blog/log-archive" },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Rocket className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            NextBlog
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname.startsWith(item.href)
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-40 xl:w-60 rounded-full border border-input bg-background/50 px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-10"
                            />
                            <button type="submit" className="absolute right-3 text-muted-foreground hover:text-primary">
                                <Search className="h-4 w-4" />
                            </button>
                        </form>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="container py-4 flex flex-col space-y-4 px-4">
                        {/* Search Bar - Mobile */}
                        <form onSubmit={handleSearch} className="flex items-center relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background/50 px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            />
                            <button type="submit" className="absolute right-3 text-muted-foreground">
                                <Search className="h-5 w-5" />
                            </button>
                        </form>

                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-base font-medium transition-colors hover:text-primary",
                                    pathname.startsWith(item.href)
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
