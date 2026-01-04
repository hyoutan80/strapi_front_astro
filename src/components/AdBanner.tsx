import { Advertisement } from "@/types";

interface AdBannerProps {
    ad: Advertisement;
    className?: string;
}

export function AdBanner({ ad, className }: AdBannerProps) {
    return (
        <div id={ad.placementId} className={`w-full my-8 flex flex-col items-center justify-center ${className}`}>
            <div
                className="ad-container max-w-full overflow-hidden [&>iframe]:max-w-full [&>img]:max-w-full"
                dangerouslySetInnerHTML={{ __html: ad.htmlCode }}
            />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-1">
                Sponsored
            </span>
        </div>
    );
}
