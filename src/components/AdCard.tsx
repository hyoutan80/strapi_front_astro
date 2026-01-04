import { Advertisement } from "@/types";
import { cn } from "@/lib/utils";

interface AdCardProps {
    ad: Advertisement;
    className?: string;
}

export function AdCard({ ad, className }: AdCardProps) {
    return (
        <div
            id={ad.placementId}
            className={cn(
                "flex flex-col h-full overflow-hidden rounded-xl border-2 border-muted bg-muted/20",
                className
            )}
        >
            <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center rounded-b-xl">
                <div
                    className="ad-container w-full h-full flex items-center justify-center [&_iframe]:!w-full [&_iframe]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_a]:!w-full [&_a]:!h-full [&_a]:!flex [&_a]:!items-center [&_a]:!justify-center"
                    dangerouslySetInnerHTML={{ __html: ad.htmlCode }}
                />
            </div>
            <div className="p-1 px-2 text-right bg-muted/30 border-t border-muted/20 shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    Sponsored
                </span>
            </div>
        </div>
    );
}
