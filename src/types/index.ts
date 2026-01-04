export interface StrapiResponse<T> {
    data: T;
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export type StrapiData<T> = {
    id: number;
    documentId: string;
    [key: string]: any;
} & T;

export interface ImageFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    url: string;
}

export interface ImageAttributes {
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
        thumbnail: ImageFormat;
        small?: ImageFormat;
        medium?: ImageFormat;
        large?: ImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: null;
    createdAt: string;
    updatedAt: string;
}

// In Strapi 5, images are also flattened but often still returned as an object or array in propertes
// Often it is: cover: { id, url, ... } or cover: { data: { id, url ... } } depending on populate
// Usually populate="*" in Strapi 5 returns the object directly if it's a component, or data/relation if it's a relation.
// For media, it's typically `{ id, url, ... }` if fully populated or `{ data: { ... } }` if legacy/relation. 
// We will try to support the flattened version primarily.

export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Article {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    description?: string;
    content: any; // Blocks or Markdown
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    display_date?: string | null;
    cover?: StrapiData<ImageAttributes> | null; // Strapi 5 might return just the object
    category?: Category | null;
    views?: number;
}

export interface Advertisement {
    id: number;
    documentId: string;
    name: string;
    htmlCode: string;
    format: "card" | "banner";
    placementId?: string;
}
