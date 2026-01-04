import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { fetchAPI } from "@/lib/strapi";
import { Article } from "@/types";
import { PopularArticles } from "@/components/PopularArticles";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    return {
        title: `${category} Articles - My Strapi Blog`,
    };
}

async function getCategoryData(slug: string) {
    const path = `/categories`;
    const urlParamsObject = {
        filters: { slug: { $eq: slug } },
    };
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData?.data?.[0];
}

async function getArticlesByCategory(slug: string) {
    const path = `/articles`;
    const urlParamsObject = {
        sort: ["display_date:desc", "publishedAt:desc"],
        filters: {
            category: {
                slug: {
                    $eq: slug,
                },
            },
        },
        populate: {
            cover: { fields: ["url"] },
            category: { populate: "*" },
        },
    };
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    // URL decode the category slug for display logic if needed or just use as is for API
    const categorySlug = category;

    // Strapi response is flat in our type definitions, so we remove .attributes
    const categoryData = await getCategoryData(categorySlug);
    const { data: articles } = await getArticlesByCategory(categorySlug);

    return (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 space-y-12">
                <Breadcrumbs items={[{ label: categoryData?.name || categorySlug }]} />
                <div className="flex flex-col items-center space-y-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl capitalize">
                        {categoryData?.name || categorySlug.replace("-", " ")}
                    </h1>
                    {categoryData?.description && (
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            {categoryData.description}
                        </p>
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {articles && articles.length > 0 ? (
                        articles.map((article: Article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))
                    ) : (
                        <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                            <h3 className="text-lg font-bold">No articles in this category</h3>
                            <p className="text-muted-foreground">
                                Check back later for new content.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <aside className="lg:col-span-4 space-y-8 sticky top-24">
                <PopularArticles categorySlug={categorySlug} />
            </aside>
        </div>
    );
}
