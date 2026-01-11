import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStrapiMedia } from "@/lib/strapi";

interface ImageSliderProps {
    images: any[];
    className?: string;
}

export function ImageSlider({ images, className }: ImageSliderProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    if (!images || !Array.isArray(images) || images.length === 0) return null;

    return (
        <div className={cn("relative group overflow-hidden rounded-xl shadow-xl my-10", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {images.map((img: any, index: number) => {
                        const imgData = img.attributes || img;
                        const imageUrl = getStrapiMedia(imgData.url);
                        if (!imageUrl) return null;

                        return (
                            <div className="flex-[0_0_100%] min-w-0 relative aspect-video" key={index}>
                                <img
                                    src={imageUrl}
                                    alt={imgData.alternativeText || `Slide ${index + 1}`}
                                    className="w-full h-full object-cover rounded-xl"
                                    loading="lazy"
                                />
                                {imgData.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
                                        <p className="text-white text-sm font-medium">
                                            {imgData.caption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-background disabled:opacity-0 z-10"
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-background disabled:opacity-0 z-10"
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-all duration-300",
                                    index === selectedIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                                )}
                                onClick={() => scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
