"use client";

import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi";

interface StrapiBlocksProps {
    content: any[];
}

export function StrapiBlocks({ content }: StrapiBlocksProps) {
    if (!content || !Array.isArray(content)) return null;

    return (
        <div className="strapi-blocks">
            {content.map((block, index) => (
                <BlockRenderer key={index} block={block} />
            ))}
        </div>
    );
}

function BlockRenderer({ block }: { block: any }) {
    switch (block.type) {
        case "heading":
            const content = <TextRenderer children={block.children} />;
            if (block.level === 1) return <h1 id={block.id}>{content}</h1>;
            if (block.level === 2) return <h2 id={block.id}>{content}</h2>;
            if (block.level === 3) return <h3 id={block.id}>{content}</h3>;
            if (block.level === 4) return <h4 id={block.id}>{content}</h4>;
            if (block.level === 5) return <h5 id={block.id}>{content}</h5>;
            return <h6 id={block.id}>{content}</h6>;

        case "paragraph":
            return (
                <p>
                    <TextRenderer children={block.children} />
                </p>
            );

        case "list":
            const ListTag = block.format === "ordered" ? "ol" : "ul";
            return (
                <ListTag>
                    {block.children.map((item: any, i: number) => (
                        <li key={i}>
                            <TextRenderer children={item.children} />
                        </li>
                    ))}
                </ListTag>
            );

        case "quote":
            return (
                <blockquote>
                    <TextRenderer children={block.children} />
                </blockquote>
            );

        case "code":
            return (
                <pre>
                    <code>
                        <TextRenderer children={block.children} />
                    </code>
                </pre>
            );

        case "image":
            const imgData = block.image;
            const imgUrl = imgData?.url || imgData?.data?.attributes?.url || imgData?.data?.url;
            const imageUrl = getStrapiMedia(imgUrl);
            if (!imageUrl) return null;
            return (
                <div className="my-8 overflow-hidden rounded-xl border border-border/40 relative">
                    <Image
                        src={imageUrl}
                        alt={block.image.alternativeText || ""}
                        width={block.image.width || 800}
                        height={block.image.height || 450}
                        layout="responsive"
                        className="object-cover rounded-xl"
                    />
                </div>
            );

        default:
            console.warn("Unknown block type:", block.type);
            return null;
    }
}

function TextRenderer({ children }: { children: any[] }) {
    if (!children) return null;

    return (
        <>
            {children.map((child, i) => {
                if (child.type === "text") {
                    let element = <>{child.text}</>;
                    if (child.bold) element = <strong>{element}</strong>;
                    if (child.italic) element = <em>{element}</em>;
                    if (child.underline) element = <u>{element}</u>;
                    if (child.strikethrough) element = <s>{element}</s>;
                    if (child.code) element = <code>{element}</code>;
                    return <span key={i}>{element}</span>;
                }

                if (child.type === "link") {
                    return (
                        <a key={i} href={child.url} target={child.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                            <TextRenderer children={child.children} />
                        </a>
                    );
                }

                return null;
            })}
        </>
    );
}
