export interface TocItem {
    id: string;
    text: string;
    level: number;
}

/**
 * コンテンツから見出しを抽出し、IDを付与した新しいコンテンツと見出しのリストを返します。
 * HTML文字列とBlocks形式（JSON配列）の両方をサポートします。
 */
export function processContentWithToc(content: any): { content: any; headings: TocItem[] } {
    const headings: TocItem[] = [];
    let headingCount = 0;

    // 1. 最も内側の実データを探す (Strapi 4/5の様々なパターンに対応)
    let rawContent = content;

    // attributes の中身をチェック
    if (content?.attributes) {
        rawContent = content.attributes.content || content.attributes.body || content.attributes;
    }

    // 文字列でも配列でもない場合、既知のラップキーを探す
    if (rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent)) {
        // フィールド名が content 以外の場合も考慮 (bodyなど)
        const candidates = [rawContent.content, rawContent.body, rawContent.data, rawContent.document, rawContent.blocks, rawContent.value];
        for (const cand of candidates) {
            if (cand && (typeof cand === 'string' || Array.isArray(cand))) {
                rawContent = cand;
                break;
            }
        }
    }

    // 2. HTML文字列の場合
    if (typeof rawContent === 'string') {
        const processedHtml = rawContent.replace(/<(h[23])(.*?)>(.*?)<\/h[23]>/g, (match, tag, attrs, text) => {
            headingCount++;
            const idMatch = attrs.match(/id=["'](.*?)["']/);
            const id = idMatch ? idMatch[1] : `heading-${headingCount}`;
            const level = parseInt(tag.substring(1));
            const cleanText = text.replace(/<[^>]*>?/gm, '');
            headings.push({ id, text: cleanText, level });

            return idMatch ? match : `<${tag} id="${id}" ${attrs}>${text}</${tag}>`;
        });
        return { content: processedHtml, headings };
    }

    // 3. Blocks形式 または ダイナミックゾーン（JSON配列）の場合
    if (Array.isArray(rawContent)) {
        const processedArray = rawContent.map((item: any) => {
            // ダイナミックゾーンのコンポーネントの場合 (例: shared.rich-text)
            if (item.__component) {
                const compName = item.__component.toLowerCase();
                // "rich-text", "rich_text", "richtext" などのバリエーションに対応
                if (compName.endsWith('rich-text') || compName.endsWith('rich_text') || compName.endsWith('richtext')) {
                    const richTextTarget = item.body || item.content;
                    if (richTextTarget) {
                        const { content: processed, headings: subHeadings } = processContentWithToc(richTextTarget);
                        headings.push(...subHeadings);
                        // body または content フィールドを更新
                        if (item.body) return { ...item, body: processed };
                        if (item.content) return { ...item, content: processed };
                    }
                }
                return item;
            }

            // 通常の Blocks 形式の Heading ブロックの場合
            if (item.type === 'heading' && (item.level === 2 || item.level === 3)) {
                headingCount++;
                const id = item.id || `heading-${headingCount}`;
                const text = item.children
                    ? item.children
                        .filter((c: any) => c.type === 'text')
                        .map((c: any) => c.text)
                        .join('')
                    : '';
                headings.push({ id, text, level: item.level });
                return { ...item, id };
            }
            return item;
        });
        return { content: processedArray, headings };
    }

    // デバッグ用: どちらの形式にも当てはまらない場合
    console.warn("processContentWithToc: Unknown content type:", typeof rawContent, rawContent);

    return { content: rawContent, headings: [] };
}
