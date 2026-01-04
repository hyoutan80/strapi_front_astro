import Image from "next/image";
import { format } from "date-fns";
import { fetchAPI, getStrapiMedia } from "@/lib/strapi";
import { ViewCounter } from "@/components/ViewCounter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdBanner } from "@/components/AdBanner";
import { Advertisement } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    // Ideally fetch article to get title
    const { slug } = await params;
    return {
        title: `Article - My Strapi Blog`,
    };
}

async function getArticle(slug: string) {
    const path = `/articles`;
    const urlParamsObject = {
        filters: { slug: { $eq: slug } },
        populate: {
            cover: { fields: ["url"] },
            category: { populate: "*" },
        },
    };
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData?.data?.[0];
}

async function getAds() {
    try {
        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const path = `/advertisements`;
        const urlParamsObject = {
            filters: { format: { $eq: "banner" } },
            pagination: { pageSize: 2 }, // Fetch up to 2 banners
        };
        const options = { headers: { Authorization: `Bearer ${token}` } };
        const responseData = await fetchAPI(path, urlParamsObject, options);
        return responseData?.data || [];
    } catch (error) {
        console.error("Failed to fetch ads:", error);
        return [];
    }
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = await getArticle(slug);
    const ads = await getAds();

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h1 className="text-2xl font-bold text-muted-foreground">Article not found</h1>
            </div>
        );
    }

    const { title, content, publishedAt, cover, category, views } = article;

    const coverData = cover as any;
    const coverUrl = coverData?.url || coverData?.data?.attributes?.url || coverData?.data?.url;
    const imageUrl = getStrapiMedia(coverUrl);

    const categoryData = category as any;
    const categoryName = categoryData?.name || categoryData?.data?.attributes?.name || categoryData?.data?.name;
    const categorySlug = categoryData?.slug || categoryData?.data?.attributes?.slug || categoryData?.data?.slug;

    const breadcrumbItems = [];
    if (categoryName && categorySlug) {
        breadcrumbItems.push({ label: categoryName, href: `/blog/${categorySlug}` });
    }
    breadcrumbItems.push({ label: title });

    return (
        <article className="container max-w-3xl py-6 lg:py-12 mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6 justify-center" />

            {/* Top Banner Ad */}
            {ads.length > 0 && <AdBanner ad={ads[0]} className="mb-8" />}

            <div className="space-y-4 text-center mb-8">
                <div className="flex items-center justify-center space-x-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {categoryName}
                    </span>
                    {publishedAt && (
                        <time className="text-sm text-muted-foreground">
                            {format(new Date(publishedAt), "MMMM dd, yyyy")}
                        </time>
                    )}
                    <ViewCounter slug={slug} initialViews={views} />
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-5xl">
                    {title}
                </h1>
            </div>

            {imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/40 bg-muted mb-10">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            )}

            <div className="prose prose-lg dark:prose-invert prose-stone mx-auto">
                {/* Basic Markdown or Text rendering fallback */}
                {/* In production, use @strapi/blocks-react-renderer or react-markdown */}
                {typeof content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} /> // If it's HTML/Markdown string
                ) : (
                    <p className="italic text-muted-foreground">
                        [Rich text content requires a renderer. If you see this, the content is in Blocks format and the renderer is not installed yet.]
                    </p>
                )}
            </div>

            {/* Bottom Banner Ad (use second ad if available, else repeat first) */}
            {ads.length > 0 && <AdBanner ad={ads[1] || ads[0]} className="mt-12" />}

        </article>
    );
}
