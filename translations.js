const translations = {
    'zh': {
        'app_title': 'OB Cloud 全球地域分布',
        'view_globe': '3D 地球',
        'view_globe_title': '3D 地球视图',
        'view_map': '2D 地图',
        'view_map_title': '平铺地图视图',
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
        'label_az_list': 'Availability Zones',
        'label_date': '开服日期',
        'label_channels': '支持的渠道',
        'label_sites': '支持的站点',
        'label_coords': '坐标',
        'no_match': '没有找到匹配的地域',
        'amap_fail': '高德地图初始化失败',
        'check_console': '请检查控制台错误信息',
        'alert_load_fail': '无法加载地域数据，请检查 data/ 目录下的 YAML 文件',
        'tbd': '待补充',
        '待补充': '待补充',

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

        // Regions
        '[政]华北2': '[政]华北2',
        '[金]华东1 (杭州)': '[金]华东1 (杭州)',
        '[金]华东2 (上海)': '[金]华东2 (上海)',
        '[金]华北2 (北京)': '[金]华北2 (北京)',
        '[金]华南1 (深圳)': '[金]华南1 (深圳)',
        '上海': '上海',
        '中国 (香港)': '中国 (香港)',
        '北京': '北京',
        '印尼 (雅加达)': '印尼 (雅加达)',
        '印度 (孟买)': '印度 (孟买)',
        '广州': '广州',
        '张家口': '张家口',
        '德国 (法兰克福)': '德国 (法兰克福)',
        '巴西 （圣保罗）': '巴西 （圣保罗)',
        '成都': '成都',
        '新加坡': '新加坡',
        '日本 (东京)': '日本 (东京)',
        '杭州': '杭州',
        '武汉': '武汉',
        '法国 （巴黎）': '法国 （巴黎)',
        '沙特 （利雅得）': '沙特 （利雅得)',
        '河源': '河源',
        '泰国 （曼谷）': '泰国 （曼谷)',
        '深圳': '深圳',
        '爱尔兰': '爱尔兰',
        '美国 (俄勒冈)': '美国 (俄勒冈)',
        '美国 (弗吉尼亚)': '美国 (弗吉尼亚)',
        '美国 (美西-加州北)': '美国 (美西-加州北)',
        '美国 （俄亥俄）': '美国 （俄亥俄)',
        '美国 （硅谷）': '美国 （硅谷)',
        '芜湖': '芜湖',
        '菲律宾 （马尼拉）': '菲律宾 （马尼拉)',
        '青岛': '青岛',
        '韩国 （首尔）': '韩国 （首尔)',
        '马来西亚 （吉隆坡）': '马来西亚 （吉隆坡)',
        '保定': '保定'
    },
    'en': {
        'app_title': 'OB Cloud Global Regions',
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
        'no_match': 'No matching regions found',
        'amap_fail': 'Map Initialization Failed',
        'check_console': 'Check console for errors',
        'alert_load_fail': 'Failed to load region data, please check YAML files in data/ directory',
        'tbd': 'TBD',
        '待补充': 'TBD',

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

        // Regions
        '[政]华北2': '[Gov] North China 2',
        '[金]华东1 (杭州)': '[Fin] East China 1 (Hangzhou)',
        '[金]华东2 (上海)': '[Fin] East China 2 (Shanghai)',
        '[金]华北2 (北京)': '[Fin] North China 2 (Beijing)',
        '[金]华南1 (深圳)': '[Fin] South China 1 (Shenzhen)',
        '上海': 'Shanghai',
        '中国 (香港)': 'China (Hong Kong)',
        '北京': 'Beijing',
        '印尼 (雅加达)': 'Indonesia (Jakarta)',
        '印度 (孟买)': 'India (Mumbai)',
        '广州': 'Guangzhou',
        '张家口': 'Zhangjiakou',
        '德国 (法兰克福)': 'Germany (Frankfurt)',
        '巴西 （圣保罗）': 'Brazil (Sao Paulo)',
        '成都': 'Chengdu',
        '新加坡': 'Singapore',
        '日本 (东京)': 'Japan (Tokyo)',
        '杭州': 'Hangzhou',
        '武汉': 'Wuhan',
        '法国 （巴黎）': 'France (Paris)',
        '沙特 （利雅得）': 'Saudi Arabia (Riyadh)',
        '河源': 'Heyuan',
        '泰国 （曼谷）': 'Thailand (Bangkok)',
        '深圳': 'Shenzhen',
        '爱尔兰': 'Ireland',
        '美国 (俄勒冈)': 'USA (Oregon)',
        '美国 (弗吉尼亚)': 'USA (Virginia)',
        '美国 (美西-加州北)': 'USA (West - N. California)',
        '美国 （俄亥俄）': 'USA (Ohio)',
        '美国 （硅谷）': 'USA (Silicon Valley)',
        '芜湖': 'Wuhu',
        '菲律宾 （马尼拉）': 'Philippines (Manila)',
        '青岛': 'Qingdao',
        '韩国 （首尔）': 'South Korea (Seoul)',
        '马来西亚 （吉隆坡）': 'Malaysia (Kuala Lumpur)',
        '保定': 'Baoding'
    },
    'ja': {
        'app_title': 'OB Cloud グローバルリージョン',
        'view_globe': '3D 地球',
        'view_globe_title': '3D地球ビュー',
        'view_map': '2D 地図',
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
        'no_match': '一致する地域が見つかりません',
        'amap_fail': '地図の初期化に失敗しました',
        'check_console': 'エラーの詳細についてはコンソールを確認してください',
        'alert_load_fail': '地域データを読み込めませんでした。data/ ディレクトリの YAML ファイルを確認してください',
        'tbd': '未定',
        '待补充': '未定',

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

        // Regions
        '[政]华北2': '[政]華北2',
        '[金]华东1 (杭州)': '[金]華東1 (杭州)',
        '[金]华东2 (上海)': '[金]華東2 (上海)',
        '[金]华北2 (北京)': '[金]華北2 (北京)',
        '[金]华南1 (深圳)': '[金]華南1 (深圳)',
        '上海': '上海',
        '中国 (香港)': '中国 (香港)',
        '北京': '北京',
        '印尼 (雅加达)': 'インドネシア (ジャカルタ)',
        '印度 (孟买)': 'インド (ムンバイ)',
        '广州': '広州',
        '张家口': '張家口',
        '德国 (法兰克福)': 'ドイツ (フランクフルト)',
        '巴西 （圣保罗）': 'ブラジル (サンパウロ)',
        '成都': '成都',
        '新加坡': 'シンガポール',
        '日本 (东京)': '日本 (東京)',
        '杭州': '杭州',
        '武汉': '武漢',
        '法国 （巴黎）': 'フランス (パリ)',
        '沙特 （利雅得）': 'サウジアラビア (リヤド)',
        '河源': '河源',
        '泰国 （曼谷）': 'タイ (バンコク)',
        '深圳': '深セン',
        '爱尔兰': 'アイルランド',
        '美国 (俄勒冈)': '米国 (オレゴン)',
        '美国 (弗吉尼亚)': '米国 (バージニア)',
        '美国 (美西-加州北)': '米国 (西部-北カリフォルニア)',
        '美国 （俄亥俄）': '米国 (オハイオ)',
        '美国 （硅谷）': '米国 (シリコンバレー)',
        '芜湖': '蕪湖',
        '菲律宾 （马尼拉）': 'フィリピン (マニラ)',
        '青岛': '青島',
        '韩国 （首尔）': '韓国 (ソウル)',
        '马来西亚 （吉隆坡）': 'マレーシア (クアラルンプール)',
        '保定': '保定'
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
