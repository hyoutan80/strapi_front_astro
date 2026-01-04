"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStrapiMedia } from "@/lib/strapi";
import { StrapiBlocks } from "./StrapiBlocks";
import { ImageSlider } from "./ImageSlider";

interface DynamicZoneProps {
    blocks: any[];
}

export function DynamicZone({ blocks }: DynamicZoneProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="space-y-12">
            {blocks.map((block, index) => {
                return (
                    <ComponentRenderer
                        key={index}
                        block={block}
                    />
                );
            })}
        </div>
    );
}

function ComponentRenderer({ block }: { block: any }) {
    const componentName = block.__component;
    const type = componentName?.split(".").pop()?.toLowerCase();

    // Markdown内の見出しに順番にIDを割り当てるためのカウンター（このブロック内のみ）
    let localHeadingIndex = 0;
    const assignedIds = block._headingIds || [];

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
                                h2: ({ node, ...props }) => {
                                    const id = assignedIds[localHeadingIndex++];
                                    return <h2 id={id} {...props} />;
                                },
                                h3: ({ node, ...props }) => {
                                    const id = assignedIds[localHeadingIndex++];
                                    return <h3 id={id} {...props} />;
                                },
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
            return <ImageSlider images={files} />;

        default:
            console.warn("Unknown component type:", type, block);
            return null;
    }
}
