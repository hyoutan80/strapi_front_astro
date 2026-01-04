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

    function _process(data: any): any {
        // 1. 最も内側の実データを探す
        let rawContent = data;
        if (data?.attributes) {
            rawContent = data.attributes.content || data.attributes.body || data.attributes;
        }

        if (rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent)) {
            const candidates = [rawContent.content, rawContent.body, rawContent.data, rawContent.document, rawContent.blocks, rawContent.value];
            for (const cand of candidates) {
                if (cand && (typeof cand === 'string' || Array.isArray(cand))) {
                    rawContent = cand;
                    break;
                }
            }
        }

        // 2. 文字列の場合 (HTML または Markdown)
        if (typeof rawContent === 'string') {
            // HTMLの見出しタグを抽出・加工
            const processedHtml = rawContent.replace(/<(h[23])(.*?)>(.*?)<\/h[23]>/g, (match, tag, attrs, text) => {
                headingCount++;
                const idMatch = attrs.match(/id=["'](.*?)["']/);
                const id = idMatch ? idMatch[1] : `heading-${headingCount}`;
                const level = parseInt(tag.substring(1));
                const cleanText = text.replace(/<[^>]*>?/gm, '');
                headings.push({ id, text: cleanText, level });

                return idMatch ? match : `<${tag} id="${id}" ${attrs}>${text}</${tag}>`;
            });

            // Markdownの見出し（##, ###）を抽出し、IDを埋め込む ({#id})
            const lines = processedHtml.split('\n');
            const processedLines = lines.map(line => {
                const h2Match = line.match(/^##\s+(.*)$/);
                const h3Match = line.match(/^###\s+(.*)$/);
                if (h2Match || h3Match) {
                    headingCount++;
                    const level = h2Match ? 2 : 3;
                    const text = (h2Match ? h2Match[1] : h3Match![1]).trim();
                    const id = `heading-${headingCount}`;
                    headings.push({ id, text, level });
                    // 見出しの末尾にIDを埋め込む (標準的なMarkdown拡張形式)
                    return `${h2Match ? '##' : '###'} ${text} {#${id}}`;
                }
                return line;
            });

            return processedLines.join('\n');
        }

        // 3. 配列（Blocks または ダイナミックゾーン）の場合
        if (Array.isArray(rawContent)) {
            return rawContent.map((item: any) => {
                if (item.__component) {
                    const compName = item.__component.toLowerCase();
                    if (compName.endsWith('rich-text') || compName.endsWith('rich_text') || compName.endsWith('richtext')) {
                        const richTextTarget = item.body || item.content;
                        if (richTextTarget) {
                            const processed = _process(richTextTarget);
                            if (item.body) return { ...item, body: processed };
                            if (item.content) return { ...item, content: processed };
                        }
                    }
                    return item;
                }

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
        }

        return rawContent;
    }

    const processedContent = _process(content);
    return { content: processedContent, headings };
}
