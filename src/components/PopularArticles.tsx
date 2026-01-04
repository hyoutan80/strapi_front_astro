import Link from "next/link";
import { Article } from "@/types";
import { fetchAPI } from "@/lib/strapi";

async function getPopularArticles(categorySlug?: string) {
    const path = `/articles`;
    const urlParamsObject: any = {
        sort: ["views:desc", "display_date:desc", "publishedAt:desc"],
        pagination: {
            page: 1,
            pageSize: 5,
        },
        fields: ["title", "slug", "views"],
    };

    if (categorySlug) {
        urlParamsObject.filters = {
            category: {
                slug: {
                    $eq: categorySlug,
                },
            },
        };
    }

    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };

    // Pass cache: no-store to ensure we get fresh view counts
    // But since fetchAPI might not support next.js cache options directly unless passed in options...
    // Let's modify fetchAPI or pass it in options if supported.
    // Our fetchAPI implementation merges options, so passing next: { revalidate: 0 } should work if using fetch.
    const responseData = await fetchAPI(path, urlParamsObject, {
        ...options,
        next: { revalidate: 60 } // Revalidate every minute
    });
    return responseData?.data || [];
}

interface PopularArticlesProps {
    categorySlug?: string;
}

export async function PopularArticles({ categorySlug }: PopularArticlesProps = {}) {
    const articles = await getPopularArticles(categorySlug);

    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Popular Articles</h3>
            </div>
            <div className="p-6 pt-0">
                <ul className="space-y-4">
                    {articles.map((article: Article, index: number) => (
                        <li key={article.id} className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                {index + 1}
                            </span>
                            <div className="space-y-1">
                                <Link
                                    href={`/article/${article.slug}`}
                                    className="font-medium leading-none hover:underline line-clamp-2"
                                >
                                    {article.title}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    {article.views || 0} views
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
