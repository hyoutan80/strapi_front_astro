import { ArticleCard } from "@/components/ArticleCard";
import { fetchAPI } from "@/lib/strapi";
import { Article } from "@/types";
import { PopularArticles } from "@/components/PopularArticles";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Search } from "lucide-react";

export const revalidate = 0; // Disable cache for search results to ensure freshness

async function searchArticles(query: string) {
    try {
        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const path = `/articles`;

        // Strapi filter for title, summary or content containing the query
        const urlParamsObject = {
            filters: {
                $or: [
                    { title: { $containsi: query } },
                    { description: { $containsi: query } },
                ],
            },
            sort: ["display_date:desc", "publishedAt:desc"],
            populate: {
                cover: { fields: ["url"] },
                category: { populate: "*" },
            },
            pagination: {
                page: 1,
                pageSize: 50,
            },
        };

        const options = { headers: { Authorization: `Bearer ${token}` } };
        const responseData = await fetchAPI(path, urlParamsObject, options);
        return responseData;
    } catch (error) {
        console.error("Failed to search articles:", error);
        return { data: [], meta: {} };
    }
}

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || "";

    if (!query) {
        return (
            <div className="flex flex-col gap-8">
                <Breadcrumbs items={[{ label: "検索" }]} />
                <section className="py-12 text-center">
                    <h1 className="text-3xl font-bold mb-4">検索</h1>
                    <p className="text-muted-foreground">検索キーワードを入力してください。</p>
                </section>
            </div>
        );
    }

    const { data: articles } = await searchArticles(query);

    return (
        <div className="flex flex-col gap-8">
            <Breadcrumbs items={[{ label: "検索", href: "/search" }, { label: query }]} />

            <section className="py-8 border-b border-border/40">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    「{query}」の検索結果
                </h1>
                <p className="text-muted-foreground">
                    {articles.length} 件の記事が見つかりました
                </p>
            </section>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
                {/* Search Results */}
                <div className="lg:col-span-8">
                    {articles.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {articles.map((article: Article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-60 w-full flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
                            <h3 className="text-xl font-bold mb-2">検索結果が見つかりませんでした</h3>
                            <p className="text-muted-foreground">
                                「{query}」に一致する記事はありませんでした。<br />
                                別のキーワードを試すか、スペルを確認してください。
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8 sticky top-24">
                    <div className="rounded-lg border border-border/40 bg-card p-6">
                        <h3 className="text-lg font-bold mb-4">キーワード検索</h3>
                        <form action="/search" method="GET" className="relative">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="記事を探す..."
                                className="h-10 w-full rounded-md border border-input bg-background px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary">
                                <Search className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                    <PopularArticles />
                </aside>
            </div>
        </div>
    );
}
