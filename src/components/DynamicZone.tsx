"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStrapiMedia } from "@/lib/strapi";
import { StrapiBlocks } from "./StrapiBlocks";

interface DynamicZoneProps {
    blocks: any[];
}

export function DynamicZone({ blocks }: DynamicZoneProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    // 全体での見出しカウンターを初期化
    let globalHeadingCount = 0;

    return (
        <div className="space-y-12">
            {blocks.map((block, index) => {
                // 各コンポーネントの見出し数を事前に計算して、カウンターを引き継ぐ必要がある
                // ただし、ここではレンダリング順にカウントを増やす簡易的な実装とします
                return (
                    <ComponentRenderer
                        key={index}
                        block={block}
                        getHeadingId={() => {
                            globalHeadingCount++;
                            return `heading-${globalHeadingCount}`;
                        }}
                    />
                );
            })}
        </div>
    );
}

function ComponentRenderer({ block, getHeadingId }: { block: any, getHeadingId: () => string }) {
    const componentName = block.__component;
    const type = componentName?.split(".").pop()?.toLowerCase();

    switch (type) {
        case "rich-text":
        case "rich_text":
        case "richtext":
            const richTextContent = block.body || block.content;
            if (Array.isArray(richTextContent)) {
                return <StrapiBlocks content={richTextContent} />;
            } else if (typeof richTextContent === "string") {
                return (
                    <div className="markdown-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ node, ...props }) => (
                                    <h2 id={getHeadingId()} {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 id={getHeadingId()} {...props} />
                                ),
                                // リンクなどのスタイル調整
                                a: ({ node, ...props }) => (
                                    <a className="text-primary hover:underline" {...props} />
                                ),
                            }}
                        >
                            {richTextContent}
                        </ReactMarkdown>
                    </div>
                );
            }
            return null;

        case "media":
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
            const quoteBody = block.body || block.quote || block.text;
            const quoteTitle = block.title || block.author;
            return (
                <blockquote className="my-8 border-l-4 border-primary pl-6 py-3 italic text-muted-foreground bg-muted/30 rounded-r-lg">
                    {quoteBody && (
                        <p className="text-xl mb-2 text-foreground">"{quoteBody}"</p>
                    )}
                    {quoteTitle && (
                        <cite className="block text-sm font-bold not-italic text-primary">
                            — {quoteTitle}
                        </cite>
                    )}
                </blockquote>
            );

        case "slider":
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
