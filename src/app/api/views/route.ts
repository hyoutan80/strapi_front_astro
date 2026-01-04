import { NextRequest, NextResponse } from "next/server";
import { fetchAPI } from "@/lib/strapi";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch the article to get its ID and current views
        const articles = await fetchAPI(
            `/articles`,
            { filters: { slug: { $eq: slug } } },
            { headers }
        );

        if (!articles?.data?.length) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const article = articles.data[0];
        const currentViews = article.views || 0;
        const newViews = currentViews + 1;

        // 2. Update the article with new views count
        // Strapi 5 uses documentId for updates usually, but let's check what we have.
        // The fetchAPI returns data with documentId.
        const documentId = article.documentId;

        if (!documentId) {
            return NextResponse.json({ error: "Article Document ID not found" }, { status: 500 });
        }

        // We need to use a PUT request to update
        // Since fetchAPI in lib/strapi.ts defaults to GET (implied by fetch usually), 
        // we might need to manually call fetch here or update fetchAPI to support methods.
        // Looking at fetchAPI implementation, it takes options which are merged into fetch options.
        // So we can pass method: 'PUT', body: JSON.stringify(...) via options.

        const updateUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles/${documentId}`;

        const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    views: newViews,
                },
            }),
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Failed to update views:", errorText);
            return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
        }

        const updatedData = await updateResponse.json();

        return NextResponse.json({ views: newViews });

    } catch (error) {
        console.error("Error in view counter API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
