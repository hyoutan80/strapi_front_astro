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

    // 見出しテキストから {#id} を抽出するためのヘルパー
    const extractId = (children: any) => {
        if (typeof children === "string") {
            const match = children.match(/\{#(.*?)\}/);
            if (match) {
                return {
                    id: match[1],
                    cleanText: children.replace(/\{#.*?\}/, "").trim()
                };
            }
        }
        // children が配列（強調などの装飾がある場合）のケースも考慮
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                if (typeof children[i] === "string") {
                    const match = children[i].match(/\{#(.*?)\}/);
                    if (match) {
                        const id = match[1];
                        // 元の配列をコピーして、IDタグ部分を空文字に置換
                        const newChildren = [...children];
                        newChildren[i] = children[i].replace(/\{#.*?\}/, "").trim();
                        return { id, cleanText: newChildren };
                    }
                }
            }
        }
        return { id: undefined, cleanText: children };
    };

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
                                h2: ({ node, children, ...props }) => {
                                    const { id, cleanText } = extractId(children);
                                    return <h2 id={id} {...props}>{cleanText}</h2>;
                                },
                                h3: ({ node, children, ...props }) => {
                                    const { id, cleanText } = extractId(children);
                                    return <h3 id={id} {...props}>{cleanText}</h3>;
                                },
                                // 画像の角丸対応
                                img: ({ node, ...props }) => (
                                    <div className="my-8 overflow-hidden rounded-xl border border-border/40">
                                        <img className="w-full h-auto object-cover" {...props} />
                                    </div>
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
                            className="object-cover rounded-xl"
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
