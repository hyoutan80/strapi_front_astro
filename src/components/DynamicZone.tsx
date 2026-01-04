"use client";

import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi";
import { StrapiBlocks } from "./StrapiBlocks";

interface DynamicZoneProps {
    blocks: any[];
}

export function DynamicZone({ blocks }: DynamicZoneProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="space-y-12">
            {blocks.map((block, index) => (
                <ComponentRenderer key={index} block={block} />
            ))}
        </div>
    );
}

function ComponentRenderer({ block }: { block: any }) {
    // Strapiのコンポーネント名は "__component" フィールドに入っています
    const componentName = block.__component;

    // 名前空間を除去した純粋な名前を取得 (例: "shared.rich-text" -> "rich-text")
    const type = componentName?.split(".").pop()?.toLowerCase();

    switch (type) {
        case "rich-text":
        case "rich_text":
        case "richtext":
            // "Shared.rich-text" コンポーネントの場合、"body" または "content" フィールドに Blocks が入っていることが多いです
            const richTextContent = block.body || block.content;
            if (Array.isArray(richTextContent)) {
                return <StrapiBlocks content={richTextContent} />;
            } else if (typeof richTextContent === "string") {
                return <div dangerouslySetInnerHTML={{ __html: richTextContent }} />;
            }
            return null;

        case "media":
            // "Shared.media" コンポーネント
            const file = block.file;
            const mediaUrl = file?.url || file?.data?.attributes?.url || file?.data?.url;
            const fullUrl = getStrapiMedia(mediaUrl);
            if (!fullUrl) return null;
            return (
                <figure className="my-8 space-y-2">
                    <div className="overflow-hidden rounded-xl border border-border/40">
                        <Image
                            src={fullUrl}
                            alt={file?.alternativeText || ""}
                            width={file?.width || 1200}
                            height={file?.height || 675}
                            layout="responsive"
                            className="object-cover"
                        />
                    </div>
                    {block.caption && (
                        <figcaption className="text-center text-sm text-muted-foreground italic">
                            {block.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case "quote":
            // "Shared.quote" コンポーネント
            return (
                <blockquote className="my-8 border-l-4 border-primary pl-6 py-2 italic text-xl text-muted-foreground bg-muted/30 rounded-r-lg">
                    <p className="mb-2">"{block.body || block.quote || block.text}"</p>
                    {block.author && (
                        <cite className="block text-sm font-bold not-italic text-primary">— {block.author}</cite>
                    )}
                </blockquote>
            );

        case "slider":
            // "Shared.slider" コンポーネント (簡易的に最初の画像、またはグリッドで表示)
            const files = block.files?.data || block.files || [];
            if (!Array.isArray(files) || files.length === 0) return null;
            return (
                <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {files.map((f: any, i: number) => {
                        const fData = f.attributes || f;
                        const fUrl = getStrapiMedia(fData.url);
                        if (!fUrl) return null;
                        return (
                            <div key={i} className="overflow-hidden rounded-lg border border-border/40 aspect-[4/3] relative">
                                <Image
                                    src={fUrl}
                                    alt={fData.alternativeText || ""}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            );

        default:
            console.warn("Unknown component type:", type, block);
            return null;
    }
}
