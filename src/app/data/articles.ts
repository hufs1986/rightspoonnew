export type Category = "politics" | "economy" | "history";

export interface Article {
    id: string;
    slug?: string;
    /** slug 우선, 없으면 id (링크용) */
    linkId: string;
    title: string;
    excerpt: string;
    category: Category;
    categoryLabel: string;
    youtubeId: string | null;
    thumbnailUrl: string;
    content: string;
    author: string;
    publishedAt: string;
    readTime: string;
    views: number;
    likes: number;
}

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
    politics: { label: "정치", color: "var(--color-cat-politics)" },
    economy: { label: "경제", color: "var(--color-cat-economy)" },
    history: { label: "역사", color: "var(--color-cat-history)" },
};

export const getCategoryValue = (label: string): Category => {
    if (label === "정치") return "politics";
    if (label === "경제") return "economy";
    if (label === "역사") return "history";
    return "politics"; // default fallback
};

// Mock articles for development
export const mockArticles: Article[] = [
    {
        id: "1",
        linkId: "1",
        title: "계엄령 논란, 헌법적 관점에서 바라본 진실",
        excerpt:
            "최근 계엄령을 둘러싼 논란이 커지고 있습니다. 헌법적 관점에서 무엇이 사실이고, 무엇이 왜곡인지 냉정하게 분석합니다.",
        category: "politics",
        categoryLabel: "정치",
        youtubeId: "dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop",
        content: `<p>최근 대한민국에서 계엄령에 대한 논란이 다시 불거지고 있습니다.</p>
<p>헌법 제77조에 따르면, 대통령은 전시·사변 또는 이에 준하는 국가비상사태에 있어서 병력으로써 군사상의 필요에 응하거나 공공의 안녕질서를 유지할 필요가 있을 때에 법률이 정하는 바에 의하여 계엄을 선포할 수 있습니다.</p>
<h2>핵심 쟁점</h2>
<p>이번 논란의 핵심은 '계엄'의 발동 요건과 절차에 대한 해석의 차이입니다. 일부 언론에서는 사실관계를 왜곡하여 보도하고 있으며, 이에 대한 정확한 팩트체크가 필요한 상황입니다.</p>
<h2>결론</h2>
<p>감정적 대응이 아닌 헌법적 원칙에 근거한 냉정한 분석이 필요한 시점입니다. 오른스푼은 사실에 기반한 분석을 통해 독자 여러분께 정확한 정보를 전달하겠습니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-07",
        readTime: "5분",
        views: 3240,
        likes: 0,
    },
    {
        id: "2",
        linkId: "2",
        title: "2026 한국 경제 전망: 오른 경제학의 관점",
        excerpt:
            "글로벌 경기 침체 속에서 한국 경제의 활로를 찾기 위한 오른 경제학적 정책 제안을 짚어봅니다.",
        category: "economy",
        categoryLabel: "경제",
        youtubeId: null,
        thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
        content: `<p>2026년 한국 경제는 대내외 불확실성이 높아진 가운데, 성장 동력 확보가 시급한 상황입니다.</p>
<h2>규제 완화의 필요성</h2>
<p>기업 활동을 옥죄는 과도한 규제를 철폐하고, 자유시장 원리에 기반한 경제 정책이 필요합니다.</p>
<h2>세금 정책</h2>
<p>법인세 인하, 상속세 개편 등 기업과 투자자 친화적인 세제 개혁이 투자와 고용을 촉진할 것입니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-06",
        readTime: "7분",
        views: 2180,
        likes: 0,
    },
    {
        id: "3",
        linkId: "3",
        title: "MZ세대 오른, 왜 늘어나고 있는가",
        excerpt:
            "젊은 세대에서 오른 가치관이 확산되는 현상의 배경과 의미를 분석합니다. 공정성에 대한 요구가 핵심입니다.",
        category: "politics",
        categoryLabel: "정치",
        youtubeId: "dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop",
        content: `<p>최근 조사에 따르면 2030세대에서 오른 가치관을 가진 비율이 크게 증가하고 있습니다.</p>
<h2>공정성이 핵심</h2>
<p>MZ세대가 오른에 공감하는 가장 큰 이유는 '공정성'입니다. 능력주의와 기회의 평등을 중시하는 이 세대는 결과의 평등을 강조하는 좌파 정책에 회의적입니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-05",
        readTime: "4분",
        views: 4560,
        likes: 0,
    },
    {
        id: "4",
        linkId: "4",
        title: "부동산 정책의 실패: 규제가 만든 역설",
        excerpt:
            "부동산 시장에 대한 과도한 규제가 어떻게 역효과를 초래했는지 데이터로 살펴봅니다.",
        category: "economy",
        categoryLabel: "경제",
        youtubeId: null,
        thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
        content: `<p>정부의 부동산 규제 정책이 오히려 집값 상승을 부추겼다는 사실은 이미 여러 데이터로 증명되었습니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-04",
        readTime: "6분",
        views: 1890,
        likes: 0,
    },
    {
        id: "5",
        linkId: "5",
        title: "안보 위기와 한미 동맹의 미래",
        excerpt:
            "북핵 위협과 변화하는 동아시아 안보 환경 속에서 한미동맹의 중요성과 발전 방향을 논합니다.",
        category: "politics",
        categoryLabel: "정치",
        youtubeId: "dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
        content: `<p>동아시아의 안보 환경이 급격히 변화하는 가운데, 한미동맹의 중요성은 그 어느 때보다 큽니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-03",
        readTime: "5분",
        views: 2750,
        likes: 0,
    },
    {
        id: "6",
        linkId: "6",
        title: "자영업의 위기, 최저임금 정책을 재고해야",
        excerpt:
            "급격한 최저임금 인상이 자영업자에게 미친 영향과 현실적인 대안을 제시합니다.",
        category: "economy",
        categoryLabel: "경제",
        youtubeId: null,
        thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
        content: `<p>급격한 최저임금 인상은 자영업자들에게 큰 부담을 주고 있습니다. 현실적인 대안이 필요합니다.</p>`,
        author: "오른스푼 에디터",
        publishedAt: "2026-04-02",
        readTime: "5분",
        views: 1430,
        likes: 0,
    },
];
