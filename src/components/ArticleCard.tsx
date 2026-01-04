import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { type Article } from "@/types";
import { getStrapiMedia } from "@/lib/strapi";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ArticleCardProps {
    article: Article;
    className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
    const { title, slug, publishedAt, cover, category, description } = article;

    // Strapi 5 response handling for images and relations
    // cover might be { url: "..." } or { data: { url: "..." } } depending on version/plugin
    const coverData = cover as any;
    const coverUrl = coverData?.url || coverData?.data?.attributes?.url || coverData?.data?.url;
    const imageUrl = getStrapiMedia(coverUrl);

    const categoryData = category as any;
    const categoryName = categoryData?.name || categoryData?.data?.attributes?.name || categoryData?.data?.name || "Uncategorized";
    const categorySlug = categoryData?.slug || categoryData?.data?.attributes?.slug || categoryData?.data?.slug;

    return (
        <Link
            href={`/article/${slug}`}
            className={cn(
                "group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all hover:shadow-lg hover:border-border/80 h-full",
                className
            )}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {categoryName}
                    </span>
                    {publishedAt && (
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(publishedAt), "MMM dd, yyyy")}
                        </span>
                    )}
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                {description && (
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center text-sm font-medium text-primary">
                    Read Article <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
