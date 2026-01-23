const translations = {
    'zh': {
        'app_title': 'OB Cloud 全球地域分布',
        'site_disclaimer_prefix': '本站点非 OceanBase 官方站点，通过开源社区维护，站长会尽力保证，但是不确保数据完整准确，您可以通过 ',
        'site_disclaimer_link': 'GitHub issues',
        'site_disclaimer_suffix': ' 反馈问题',
        'notice_close': '关闭提示',
        'view_globe': '地球',
        'view_globe_title': '地球视图',
        'view_map': '地图',
        'view_map_title': '地图视图',
        'view_table': '列表',
        'view_table_title': '列表视图',
        'filter_all_sites': '所有站点',
        'filter_all_providers': '所有云厂商',
        'filter_all_channels': '所有渠道',
        'search_placeholder': '搜索区域...',
        'loading_map': '地图资源加载中...',
        'loading_amap': '地图加载中...',
        'legend_cloud_provider': '云厂商',
        'table_provider': '云厂商',
        'table_region': '地域',
        'table_code': '地域代码',
        'table_az': '可用区数量',
        'table_az_list': '可用区列表',
        'table_date': '开服日期',
        'table_channels': '支持的渠道',
        'table_sites': '支持的站点',
        'sidebar_title': '地域信息',
        'sidebar_empty': '点击地图上的标记点查看地域详细信息',
        'popup_title': '选择地域',
        'label_provider': '云厂商',
        'label_code': '地域代码',
        'label_az': '可用区数量',
        'label_az_list': '可用区列表',
        'label_date': '开服日期',
        'label_channels': '支持的渠道',
        'label_sites': '支持的站点',
        'label_coords': '坐标',
        'offline_status': '已下线',
        'no_match': '没有找到匹配的地域',
        'amap_fail': '高德地图初始化失败',
        'check_console': '请检查控制台错误信息',
        'alert_load_fail': '无法加载地域数据，请检查 data/ 目录下的 YAML 文件',
        'tbd': '待补充',
        '待补充': '待补充',
        '已下线': '已下线',

        // Cloud Providers
        '阿里云': '阿里云',
        'AWS': 'AWS',
        'Azure': 'Azure',
        '百度云': '百度云',
        'GCP': 'GCP',
        '华为云': '华为云',
        '腾讯云': '腾讯云',

        // Sites
        '中国站': '中国站',
        '国际站': '国际站',

        // Channels
        '官网渠道': '官网渠道',
        '精选商城': '精选商城',
        '自运营': '自运营',
        '云市场': '云市场',
        '阿里巴巴 CC': '阿里巴巴 CC',
        '联营联运': '联营联运',

        // Composite Channels (Site + Channel)
        '中国站-官网渠道': '中国站-官网渠道',
        '中国站-精选商城': '中国站-精选商城',
        '中国站-自运营': '中国站-自运营',
        '中国站-阿里巴巴 CC': '中国站-阿里巴巴 CC',
        '中国站-联营联运': '中国站-联营联运',
        '国际站-官网渠道': '国际站-官网渠道',
        '国际站-云市场': '国际站-云市场',
        '国际站-自运营': '国际站-自运营',

        // Regions
        '中国-北京政务': '中国-北京政务',
        '中国-杭州金': '中国-杭州金',
        '中国-上海金': '中国-上海金',
        '中国-北京金': '中国-北京金',
        '中国-上海': '中国-上海',
        '中国-香港': '中国-香港',
        '中国-北京': '中国-北京',
        '东南亚-雅加达': '东南亚-雅加达',
        '中国-广州': '中国-广州',
        '中国-张家口': '中国-张家口',
        '欧洲-法兰克福': '欧洲-法兰克福',
        '东南亚-新加坡': '东南亚-新加坡',
        '中国-杭州': '中国-杭州',
        '中东-利雅得': '中东-利雅得',
        '中国-河源': '中国-河源',
        '东南亚-曼谷': '东南亚-曼谷',
        '中国-深圳': '中国-深圳',
        '美国-弗吉尼亚': '美国-弗吉尼亚',
        '美国-硅谷': '美国-硅谷',
        '中国-青岛': '中国-青岛',
        '东亚-首尔': '东亚-首尔',
        '东南亚-吉隆坡': '东南亚-吉隆坡',
        '南亚-孟买': '南亚-孟买',
        '南美洲-圣保罗': '南美洲-圣保罗',
        '东亚-东京': '东亚-东京',
        '欧洲-巴黎': '欧洲-巴黎',
        '美国-俄勒冈': '美国-俄勒冈',
        '美国-美西-加州北': '美国-美西-加州北',
        '美国-俄亥俄': '美国-俄亥俄',
        '中国-芜湖': '中国-芜湖',
        '中国-保定': '中国-保定',
        '中国-武汉': '中国-武汉',
        '欧洲-爱尔兰': '欧洲-爱尔兰',
        '美国-美东2（弗吉尼亚）': '美国-美东2（弗吉尼亚）'
    },
    'en': {
        'app_title': 'OB Cloud Global Regions',
        'site_disclaimer_prefix': 'This site is community-maintained and not an official OceanBase site. The maintainer will try to keep the data accurate, but completeness is not guaranteed. You can report issues via ',
        'site_disclaimer_link': 'GitHub issues',
        'site_disclaimer_suffix': '.',
        'notice_close': 'Close notice',
        'view_globe': 'Globe',
        'view_globe_title': '3D Globe View',
        'view_map': 'Map',
        'view_map_title': 'Flat Map View',
        'view_table': 'Table',
        'view_table_title': 'Table View',
        'filter_all_sites': 'All Sites',
        'filter_all_providers': 'All Providers',
        'filter_all_channels': 'All Channels',
        'search_placeholder': 'Search Region...',
        'loading_map': 'Loading map resources...',
        'loading_amap': 'Loading map...',
        'legend_cloud_provider': 'Cloud Provider',
        'table_provider': 'Cloud Provider',
        'table_region': 'Region',
        'table_code': 'Region Code',
        'table_az': 'AZ Count',
        'table_az_list': 'Availability Zones',
        'table_date': 'Launch Date',
        'table_channels': 'Supported Channels',
        'table_sites': 'Supported Sites',
        'sidebar_title': 'Region Info',
        'sidebar_empty': 'Click markers to view details',
        'popup_title': 'Select Region',
        'label_provider': 'Cloud Provider',
        'label_code': 'Region Code',
        'label_az': 'AZ Count',
        'label_az_list': 'Availability Zones',
        'label_date': 'Launch Date',
        'label_channels': 'Supported Channels',
        'label_sites': 'Supported Sites',
        'label_coords': 'Coordinates',
        'offline_status': 'Offline',
        'no_match': 'No matching regions found',
        'amap_fail': 'Map Initialization Failed',
        'check_console': 'Check console for errors',
        'alert_load_fail': 'Failed to load region data, please check YAML files in data/ directory',
        'tbd': 'TBD',
        '待补充': 'TBD',
        '已下线': 'Offline',

        // Cloud Providers
        '阿里云': 'Alibaba Cloud',
        'AWS': 'AWS',
        'Azure': 'Azure',
        '百度云': 'Baidu Cloud',
        'GCP': 'GCP',
        '华为云': 'Huawei Cloud',
        '腾讯云': 'Tencent Cloud',

        // Sites
        '中国站': 'China Site',
        '国际站': 'International Site',

        // Channels
        '官网渠道': 'Official Website',
        '精选商城': 'Selected Mall',
        '自运营': 'Self-operated',
        '云市场': 'Marketplace',
        '阿里巴巴 CC': 'Alibaba CC',
        '联营联运': 'Joint Operation',

        // Composite Channels (Site + Channel)
        '中国站-官网渠道': 'China Site - Official Website',
        '中国站-精选商城': 'China Site - Selected Mall',
        '中国站-自运营': 'China Site - Self-operated',
        '中国站-阿里巴巴 CC': 'China Site - Alibaba CC',
        '中国站-联营联运': 'China Site - Joint Operation',
        '国际站-官网渠道': 'International Site - Official Website',
        '国际站-云市场': 'International Site - Marketplace',
        '国际站-自运营': 'International Site - Self-operated',

        // Regions
        '中国-北京政务': 'China - Beijing Gov',
        '中国-杭州金': 'China - Hangzhou Finance',
        '中国-上海金': 'China - Shanghai Finance',
        '中国-北京金': 'China - Beijing Finance',
        '中国-上海': 'China - Shanghai',
        '中国-香港': 'China - Hong Kong',
        '中国-北京': 'China - Beijing',
        '东南亚-雅加达': 'Southeast Asia - Jakarta',
        '中国-广州': 'China - Guangzhou',
        '中国-张家口': 'China - Zhangjiakou',
        '欧洲-法兰克福': 'Europe - Frankfurt',
        '东南亚-新加坡': 'Southeast Asia - Singapore',
        '中国-杭州': 'China - Hangzhou',
        '中东-利雅得': 'Middle East - Riyadh',
        '中国-河源': 'China - Heyuan',
        '东南亚-曼谷': 'Southeast Asia - Bangkok',
        '中国-深圳': 'China - Shenzhen',
        '美国-弗吉尼亚': 'USA - Virginia',
        '美国-硅谷': 'USA - Silicon Valley',
        '中国-青岛': 'China - Qingdao',
        '东亚-首尔': 'East Asia - Seoul',
        '东南亚-吉隆坡': 'Southeast Asia - Kuala Lumpur',
        '南亚-孟买': 'South Asia - Mumbai',
        '南美洲-圣保罗': 'South America - Sao Paulo',
        '东亚-东京': 'East Asia - Tokyo',
        '欧洲-巴黎': 'Europe - Paris',
        '美国-俄勒冈': 'USA - Oregon',
        '美国-美西-加州北': 'USA - West (N. California)',
        '美国-俄亥俄': 'USA - Ohio',
        '中国-芜湖': 'China - Wuhu',
        '中国-保定': 'China - Baoding',
        '中国-武汉': 'China - Wuhan',
        '欧洲-爱尔兰': 'Europe - Ireland',
        '美国-美东2（弗吉尼亚）': 'USA - East 2 (Virginia)'
    },
    'ja': {
        'app_title': 'OB Cloud グローバルリージョン',
        'site_disclaimer_prefix': '本サイトは OceanBase の公式サイトではなく、コミュニティでメンテナンスされています。管理人が可能な限り正確さを保ちますが、データの完全性と正確性は保証できません。GitHub の Issue から ',
        'site_disclaimer_link': 'フィードバック',
        'site_disclaimer_suffix': ' をお寄せください。',
        'notice_close': '通知を閉じる',
        'view_globe': '地球',
        'view_globe_title': '地球ビュー',
        'view_map': '地図',
        'view_map_title': '地図ビュー',
        'view_table': 'リスト',
        'view_table_title': 'リストビュー',
        'filter_all_sites': 'すべてのサイト',
        'filter_all_providers': 'すべてのプロバイダー',
        'filter_all_channels': 'すべてのチャネル',
        'search_placeholder': '地域を検索...',
        'loading_map': '地図リソースを読み込み中...',
        'loading_amap': '地図を読み込み中...',
        'legend_cloud_provider': 'クラウドプロバイダー',
        'table_provider': 'クラウドプロバイダー',
        'table_region': '地域',
        'table_code': '地域コード',
        'table_az': 'AZ数',
        'table_az_list': 'アベイラビリティーゾーン',
        'table_date': '開始日',
        'table_channels': 'サポートされるチャネル',
        'table_sites': 'サポートされるサイト',
        'sidebar_title': '地域情報',
        'sidebar_empty': '地図上のマーカーをクリックして詳細を表示',
        'popup_title': '地域を選択',
        'label_provider': 'クラウドプロバイダー',
        'label_code': '地域コード',
        'label_az': 'AZ数',
        'label_az_list': 'アベイラビリティーゾーン',
        'label_date': '開始日',
        'label_channels': 'サポートされるチャネル',
        'label_sites': 'サポートされるサイト',
        'label_coords': '座標',
        'offline_status': 'オフライン',
        'no_match': '一致する地域が見つかりません',
        'amap_fail': '地図の初期化に失敗しました',
        'check_console': 'エラーの詳細についてはコンソールを確認してください',
        'alert_load_fail': '地域データを読み込めませんでした。data/ ディレクトリの YAML ファイルを確認してください',
        'tbd': '未定',
        '待补充': '未定',
        '已下线': 'オフライン',

        // Cloud Providers
        '阿里云': 'Alibaba Cloud',
        'AWS': 'AWS',
        'Azure': 'Azure',
        '百度云': 'Baidu Cloud',
        'GCP': 'GCP',
        '华为云': 'Huawei Cloud',
        '腾讯云': 'Tencent Cloud',

        // Sites
        '中国站': '中国サイト',
        '国际站': '国際サイト',

        // Channels
        '官网渠道': '公式サイト',
        '精选商城': '厳選モール',
        '自运营': '自社運営',
        '云市场': 'マーケットプレイス',
        '阿里巴巴 CC': 'Alibaba CC',
        '联营联运': '共同運営',

        // Composite Channels (Site + Channel)
        '中国站-官网渠道': '中国サイト - 公式サイト',
        '中国站-精选商城': '中国サイト - 厳選モール',
        '中国站-自运营': '中国サイト - 自社運営',
        '中国站-阿里巴巴 CC': '中国サイト - Alibaba CC',
        '中国站-联营联运': '中国サイト - 共同運営',
        '国际站-官网渠道': '国際サイト - 公式サイト',
        '国际站-云市場': '国際サイト - マーケットプレイス', // Correcting previous finding to existing key context if any, but adding fresh here.
        '国际站-云市场': '国際サイト - マーケットプレイス',
        '国际站-自运营': '国際サイト - 自社運営',

        // Regions
        '中国-北京政务': '中国 - 北京（政務）',
        '中国-杭州金': '中国 - 杭州（金融）',
        '中国-上海金': '中国 - 上海（金融）',
        '中国-北京金': '中国 - 北京（金融）',
        '中国-上海': '中国 - 上海',
        '中国-香港': '中国 - 香港',
        '中国-北京': '中国 - 北京',
        '东南亚-雅加达': '東南アジア - ジャカルタ',
        '中国-广州': '中国 - 広州',
        '中国-张家口': '中国 - 張家口',
        '欧洲-法兰克福': 'ヨーロッパ - フランクフルト',
        '东南亚-新加坡': '東南アジア - シンガポール',
        '中国-杭州': '中国 - 杭州',
        '中东-利雅得': '中東 - リヤド',
        '中国-河源': '中国 - 河源',
        '东南亚-曼谷': '東南アジア - バンコク',
        '中国-深圳': '中国 - 深セン',
        '美国-弗吉尼亚': '米国 - バージニア',
        '美国-硅谷': '米国 - シリコンバレー',
        '中国-青岛': '中国 - 青島',
        '东亚-首尔': '東アジア - ソウル',
        '东南亚-吉隆坡': '東南アジア - クアラルンプール',
        '南亚-孟买': '南アジア - ムンバイ',
        '南美洲-圣保罗': '南アメリカ - サンパウロ',
        '东亚-东京': '東アジア - 東京',
        '欧洲-巴黎': 'ヨーロッパ - パリ',
        '美国-俄勒冈': '米国 - オレゴン',
        '美国-美西-加州北': '米国 - 西部（北カリフォルニア）',
        '美国-俄亥俄': '米国 - オハイオ',
        '中国-芜湖': '中国 - 蕪湖',
        '中国-保定': '中国 - 保定',
        '中国-武汉': '中国 - 武漢',
        '欧洲-爱尔兰': 'ヨーロッパ - アイルランド',
        '美国-美东2（弗吉尼亚）': '米国 - 東部2（バージニア）'
    }
};

function getSupportedLang(lang) {
    if (!lang) return 'en';
    const lower = lang.toLowerCase();
    if (translations[lower]) return lower;
    if (lower.startsWith('zh')) return 'zh';
    if (lower.startsWith('ja')) return 'ja';
    return 'en';
}

function detectInitialLanguage() {
    const navLang = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || '';
    return getSupportedLang(navLang);
}

let currentLang = detectInitialLanguage();

function setLanguage(lang) {
    const normalized = getSupportedLang(lang);
    if (translations[normalized]) {
        currentLang = normalized;
        updatePageText();
        // Trigger data update if necessary (e.g., re-render table)
        if (typeof updateCurrentView === 'function') {
            updateCurrentView();
        }
        if (typeof initializeFilters === 'function') {
            // Re-initialize filters to update default options
            // Note: This might reset selections, so handle with care or just update text
            updateFilterPlaceholders();
            // We also need to re-populate options if they are translated
            // But initializeFilters re-creates options from data. 
            // To keep it simple, we might just reload filters or let user re-select if needed
            // Better: re-run initializeFilters() but try to preserve selection if possible?
            // For now, just update placeholders. The options themselves will be refreshed if we call initializeFilters()
            // actually updateCurrentView() doesn't refresh filters.
            // Let's just refresh filters to update option text.
            initializeFilters();
        }
        if (typeof resetSidebar === 'function') {
            if (!selectedRegion) {
                resetSidebar();
            } else {
                showRegionInfo(selectedRegion);
            }
        }

        // Update AMap language by dispatching an event
        const event = new CustomEvent('languageChanged', { detail: { lang: lang } });
        document.dispatchEvent(event);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updatePageText() {
    console.log('[i18n] Updating page text for language:', currentLang);
    // Handle standard text content updates
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            console.log(`[i18n] Updating element <${element.tagName.toLowerCase()}> with key "${key}" to "${translations[currentLang][key]}"`);
            if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                element.placeholder = translations[currentLang][key];
            } else {
                element.textContent = translations[currentLang][key];
            }
        } else {
            console.warn(`[i18n] Missing translation for key "${key}" in language "${currentLang}"`);
        }
    });

    // Handle title attribute updates
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[currentLang][key]) {
            console.log(`[i18n] Updating title for <${element.tagName.toLowerCase()}> with key "${key}" to "${translations[currentLang][key]}"`);
            element.title = translations[currentLang][key];
        } else {
            console.warn(`[i18n] Missing title translation for key "${key}" in language "${currentLang}"`);
        }
    });

    // Update document title
    if (translations[currentLang]['app_title']) {
        document.title = translations[currentLang]['app_title'];
    }

    // Update html lang attribute
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : currentLang;
}

function updateFilterPlaceholders() {
    // This is now handled by initializeFilters re-running
}

// Region area sorting priority by language
const regionAreaPriority = {
    'zh': {
        '中国': 1,
        '美国': 2,
        '欧洲': 3,
        '东南亚': 4,
        '南亚': 5,
        '中东': 6,
        '南美洲': 7,
        '南美': 7
    },
    'en': {
        '美国': 1,
        '中国': 2,
        '欧洲': 3,
        '东南亚': 4,
        '南亚': 5,
        '中东': 6,
        '南美洲': 7,
        '南美': 7
    },
    'ja': {
        '东亚': 1,
        '中国': 2,
        '美国': 3,
        '欧洲': 4,
        '东南亚': 5,
        '南亚': 6,
        '中东': 7,
        '南美洲': 8,
        '南美': 8
    }
};

function getRegionAreaPriority() {
    return regionAreaPriority[currentLang] || regionAreaPriority['en'];
}
