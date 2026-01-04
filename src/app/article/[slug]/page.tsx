import Image from "next/image";
import { format } from "date-fns";
import { fetchAPI, getStrapiMedia } from "@/lib/strapi";
import { ViewCounter } from "@/components/ViewCounter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdBanner } from "@/components/AdBanner";
import { processContentWithToc } from "@/lib/toc";
import { TableOfContents } from "@/components/TableOfContents";
import { PopularArticles } from "@/components/PopularArticles";
import { DynamicZone } from "@/components/DynamicZone";

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
            blocks: {
                populate: "*",
            },
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

    // Strapi 4/5 structure handling: favor attributes if present
    const articleData = article.attributes || article;
    const { title, content, publishedAt, cover, category, views, blocks } = articleData;

    // Use blocks if present (Dynamic Zone), otherwise fallback to content
    const rawContentSource = (blocks && Array.isArray(blocks) && blocks.length > 0)
        ? blocks
        : (articleData.content || content);

    // Process content for ToC (supports String, Blocks, and Dynamic Zone)
    const { content: processedContent, headings } = processContentWithToc(rawContentSource);

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
        <div className="container py-6 lg:py-12 mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6 justify-center" />

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
                {/* Main Content */}
                <article className="lg:col-span-8">
                    {/* Top Banner Ad */}
                    {ads.length > 0 && <AdBanner ad={ads[0]} className="mb-8" />}

                    <header className="space-y-4 text-center mb-8">
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
                    </header>

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

                    {/* Mobile Table of Contents (Shown before content on mobile) */}
                    {headings.length > 0 && (
                        <TableOfContents items={headings} className="mb-8 lg:hidden" />
                    )}

                    <div className="prose prose-lg dark:prose-invert prose-stone mx-auto max-w-none">
                        {/* Rendering based on content type */}
                        {Array.isArray(processedContent) ? (
                            <DynamicZone blocks={processedContent} />
                        ) : typeof processedContent === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                        ) : (
                            <p className="italic text-muted-foreground">コンテンツを読み込めませんでした。</p>
                        )}
                    </div>

                    {/* Bottom Banner Ad (use second ad if available, else repeat first) */}
                    {ads.length > 0 && <AdBanner ad={ads[1] || ads[0]} className="mt-12" />}
                </article>

                {/* Sidebar (Desktop only) */}
                <aside className="hidden lg:block lg:col-span-4 space-y-8 sticky top-24">
                    {/* Desktop Table of Contents */}
                    {headings.length > 0 && (
                        <TableOfContents items={headings} />
                    )}

                    {/* Ranking (Popular Articles) */}
                    <PopularArticles categorySlug={categorySlug} />
                </aside>
            </div>
        </div>
    );
}
