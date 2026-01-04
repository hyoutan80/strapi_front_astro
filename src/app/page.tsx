import { ArticleCard } from "@/components/ArticleCard";
import { AdCard } from "@/components/AdCard";
import { fetchAPI } from "@/lib/strapi";
import { Article, Advertisement } from "@/types";
import { PopularArticles } from "@/components/PopularArticles";

export const revalidate = 60; // Revalidate every 60 seconds

async function getArticles() {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: ["createdAt:desc"],
      populate: {
        cover: { fields: ["url"] },
        category: { populate: "*" },
      },
      pagination: {
        page: 1,
        pageSize: 20, // Increased to ensure we have enough content to mix ads
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return { data: [], meta: {} };
  }
}

async function getAds() {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/advertisements`;
    const urlParamsObject = {
      filters: { format: { $eq: "card" } },
      pagination: { pageSize: 10 },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData?.data || [];
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
}

export default async function Home() {
  const { data: articles } = await getArticles();
  const ads = await getAds();

  // 1. Separate Ads
  const fixedAds: { ad: Advertisement; index: number }[] = [];
  const autoAds: Advertisement[] = [];

  ads.forEach((ad: Advertisement) => {
    const pid = parseInt(ad.placementId || "", 10);
    if (!isNaN(pid) && pid > 0) {
      fixedAds.push({ ad, index: pid - 1 }); // 1-based to 0-based
    } else {
      autoAds.push(ad);
    }
  });

  // Sort fixed ads by index ascending to ensure correct splice behavior for "Slot X" logic
  // (Splice shifts subsequent items, so inserting at 2 then 4 works naturally for visual slots)
  fixedAds.sort((a, b) => a.index - b.index);

  // 2. Initial List (Articles)
  const finalContent: (Article | Advertisement)[] = [...articles];

  // 3. Insert Fixed Ads
  // We explicitly insert them at the user-requested slot.
  fixedAds.forEach(({ ad, index }) => {
    // Ensure index is within arguably reasonable bounds (allow appending)
    if (index <= finalContent.length) {
      finalContent.splice(index, 0, ad);
    } else {
      finalContent.push(ad);
    }
  });

  // 4. Insert Auto Ads (Spacing)
  // We want to avoid placing auto ads right next to fixed ads if possible,
  // and maintain a rhythm of ~5 items between ads.
  let itemsSinceLastAd = 0;
  let autoAdIndex = 0;

  // We iterate with a traditional loop because the array grows
  for (let i = 0; i < finalContent.length; i++) {
    const item = finalContent[i];
    const isAd = 'htmlCode' in item;

    if (isAd) {
      itemsSinceLastAd = 0;
    } else {
      itemsSinceLastAd++;
    }

    // If we have enough gap and have auto ads available
    if (itemsSinceLastAd >= 5 && autoAdIndex < autoAds.length) {
      const adToInsert = autoAds[autoAdIndex];
      // Insert at next position
      finalContent.splice(i + 1, 0, adToInsert);

      // Reset
      itemsSinceLastAd = 0;
      autoAdIndex++;
      i++; // Skip the newly inserted item in this loop iteration
    }
  }

  // Fallback: If no auto ads were inserted (e.g., fewer than 5 items), append one at the end
  if (autoAdIndex === 0 && autoAds.length > 0 && finalContent.length > 0) {
    finalContent.push(autoAds[0]);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center space-y-4 text-center pt-8 pb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
          Explore the Future
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Tech, Culture, and Modern Methodologies. A collection of thoughts and experiments.
        </p>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">

        {/* Latest Articles */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
          </div>

          {finalContent.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {finalContent.map((item: any, index: number) => {
                // Distinguish between Article and Advertisement
                // Ad has 'htmlCode', Article has 'title', etc.
                if ('htmlCode' in item) {
                  return <AdCard key={`ad-${item.id}-${index}`} ad={item as Advertisement} />;
                } else {
                  return <ArticleCard key={`article-${item.id}`} article={item as Article} />;
                }
              })}
            </div>
          ) : (
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <h3 className="text-lg font-bold">No articles found</h3>
              <p className="text-muted-foreground">
                Make sure Strapi is running and you have published some content.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8 sticky top-24">
          <PopularArticles />
        </aside>

      </div>
    </div>
  );
}
