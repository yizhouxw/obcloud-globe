// Global state
let regionsData = [];
let filteredRegions = [];
let currentViewMode = 'globe';
let selectedRegion = null;
let overlappingMarkersPopup = null;
let hoverTimeout = null; // Global hover timeout for popup management
let tableScrollSynced = false;
let regionModal = null;
let regionModalClose = null;
let regionModalBackdrop = null;
let regionModalBody = null;

// Globe components
let currentGlobe = null;
let currentGlobeStyle = 'classic';

// 高德地图 components
let amapMap;
let amapMarkers = [];
let isAMapLoaded = false;
let amapScriptLang = null;
let amapScriptEl = null;

// Cloud provider color configuration
const CLOUD_PROVIDER_COLORS = {
    'AWS': {
        color: 0xFF9900,        // Orange
        name: 'AWS',
        icon: '☁️'
    },
    'Azure': {
        color: 0x0078D4,        // Blue
        name: 'Azure',
        icon: '☁️'
    },
    'GCP': {
        color: 0x4285F4,        // Google Blue
        name: 'GCP',
        icon: '☁️'
    },
    '阿里云': {
        color: 0xFF6900,        // Alibaba Orange
        name: '阿里云',
        icon: '☁️'
    },
    '华为云': {
        color: 0xFF0000,        // Red
        name: '华为云',
        icon: '☁️'
    },
    '腾讯云': {
        color: 0x00A4FF,        // Tencent Blue
        name: '腾讯云',
        icon: '☁️'
    },
    '百度云': {
        color: 0x2932E1,        // Baidu Blue
        name: '百度云',
        icon: '☁️'
    }
};

// Get cloud provider color configuration
function getCloudProviderConfig(provider) {
    return CLOUD_PROVIDER_COLORS[provider] || {
        color: 0x4CAF50,         // Default green
        name: provider || 'Unknown',
        icon: '☁️'
    };
}

// Detect mobile viewport
function isMobile() {
    return window.innerWidth <= 768;
}

// Geo helpers for overlap detection
const GEO_CLOSE_KM = 5;          // Regions within 5km treated as same place
const SCREEN_CLOSE_PX = 30;      // Screen proximity threshold

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function coordsEqual(posA, posB, tol = 1e-4) {
    if (!posA || !posB || posA.length < 2 || posB.length < 2) return false;
    return Math.abs(posA[0] - posB[0]) < tol && Math.abs(posA[1] - posB[1]) < tol;
}

// Determine overlapping markers: prioritize geographic proximity (zoom-independent),
// then fall back to screen proximity (pixel distance based on current zoom).
function findOverlappingMarkers(targetMarker, targetRegion, targetPixel = null) {
    if (!amapMap) return [];

    const basePixel = targetPixel || amapMap.lngLatToContainer(targetMarker.getPosition());

    const samePlaceMarkers = [];
    const screenCloseMarkers = [];

    amapMarkers.forEach(m => {
        if (m === targetMarker) return;
        if (!m.userData || !m.userData.region) return;
        const r = m.userData.region;

        // Geo closeness (5km) or near-identical coordinates
        const geoClose = haversineDistanceKm(targetRegion.latitude, targetRegion.longitude, r.latitude, r.longitude) <= GEO_CLOSE_KM ||
                         coordsEqual(m.userData.position, [targetRegion.longitude, targetRegion.latitude]);
        if (geoClose) {
            samePlaceMarkers.push(m);
            return;
        }

        // Screen proximity based on current zoom
        const otherPixel = amapMap.lngLatToContainer(m.getPosition());
        const dist = Math.sqrt(
            Math.pow(otherPixel.x - basePixel.x, 2) +
            Math.pow(otherPixel.y - basePixel.y, 2)
        );
        if (dist < SCREEN_CLOSE_PX) {
            screenCloseMarkers.push(m);
        }
    });

    if (samePlaceMarkers.length > 0) return samePlaceMarkers;
    return screenCloseMarkers;
}

function isSidebarVisible() {
    const sidebar = document.getElementById('region-info-sidebar');
    if (!sidebar) return false;
    return window.getComputedStyle(sidebar).display !== 'none';
}

function shouldUseModal() {
    // Use modal when on mobile, or when sidebar is hidden by responsive CSS
    return isMobile() || !isSidebarVisible() || currentViewMode === 'table';
}

// Shorten legend labels on mobile (e.g., drop trailing "Cloud")
function getLegendLabel(provider) {
    const label = t(provider);
    if (window.innerWidth <= 768) {
        return label.replace(/\s*Cloud$/i, '').trim();
    }
    return label;
}

// Initialize application
async function init() {
    // Load map script with current language
    loadAMapScript(currentLang);

    // Initialize translations
    updatePageText();

    await loadRegionsData();
    setupRegionModal();
    setupEventListeners();
    setupTableScrollSync();
    initializeFilters();
    // Initialize sidebar to empty state
    resetSidebar();
    switchView('globe');

    // Listen for language changes
    document.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        const langCode = lang === 'zh' ? 'zh_cn' : 'en';
        console.log(`[App] Recreating AMap with lang: ${lang}`);
        if (!isAMapLoaded || amapScriptLang !== langCode) {
            loadAMapScript(lang);
        } else if (currentViewMode === 'map') {
            recreateAMap(lang);
        }
    });
}

// Load AMap Script with target language
function loadAMapScript(targetLang = currentLang) {
    if (typeof AMAP_API_KEY === 'undefined' || AMAP_API_KEY === 'YOUR_AMAP_KEY_HERE') {
        console.warn('高德地图 API Key 未配置，请在 config.js 中设置 AMAP_API_KEY');
        return;
    }

    const langCode = targetLang === 'zh' ? 'zh_cn' : 'en';

    // If already loaded with same language, do nothing
    if (isAMapLoaded && amapScriptLang === langCode) {
        return;
    }

    // Remove existing script tag if present
    if (amapScriptEl && amapScriptEl.parentNode) {
        amapScriptEl.parentNode.removeChild(amapScriptEl);
    }

    // Reset flags before reloading
    isAMapLoaded = false;
    window.AMap = undefined;

    const script = document.createElement('script');
    script.id = 'amap-script';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_API_KEY}&language=${langCode}`;
    script.async = true;
    script.onload = function() {
        console.log(`高德地图 API 加载完成 (language=${langCode})`);
        isAMapLoaded = true;
        amapScriptLang = langCode;
        // If currently in map view, recreate the map to apply language
        if (currentViewMode === 'map') {
            recreateAMap(currentLang);
        }
    };
    script.onerror = function() {
        console.error('高德地图 API 加载失败，请检查 API Key 或网络');
    };

    amapScriptEl = script;
    document.head.appendChild(script);
}

// Load regions data from multiple YAML files (one per cloud provider)
async function loadRegionsData() {
    try {
        // List of cloud provider data files
        const providerFiles = [
            'data/alibaba.yaml',
            'data/aws.yaml',
            'data/azure.yaml',
            'data/gcp.yaml',
            'data/huawei.yaml',
            'data/tencent.yaml',
            'data/baidu.yaml'
        ];
        
        // Load all provider files in parallel
        const loadPromises = providerFiles.map(async (file) => {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    console.warn(`Failed to load ${file}: ${response.statusText}`);
                    return { regions: [] };
                }
                const yamlText = await response.text();
                const data = jsyaml.load(yamlText);
                // Ensure region_code is present if not parsed correctly or missing
                // (Though if it is in YAML, it should be parsed)
                return data || { regions: [] };
            } catch (error) {
                console.warn(`Error loading ${file}:`, error);
                return { regions: [] };
            }
        });
        
        const allData = await Promise.all(loadPromises);
        
        // Merge all regions from all providers
        regionsData = [];
        allData.forEach((data, index) => {
            if (data.regions && Array.isArray(data.regions)) {
                regionsData.push(...data.regions);
                console.log(`Loaded ${data.regions.length} regions from ${providerFiles[index]}`);
            }
        });
        
        filteredRegions = [...regionsData];
        
        // Validate and log coordinate information
        let validCoordinates = 0;
        let missingCoordinates = 0;
        let invalidCoordinates = 0;
        
        regionsData.forEach(region => {
            if (!region.latitude || !region.longitude) {
                missingCoordinates++;
                console.warn(`Region "${region.region}" (${region.cloud_provider}) is missing coordinates`);
            } else if (region.latitude < -90 || region.latitude > 90 || 
                      region.longitude < -180 || region.longitude > 180) {
                invalidCoordinates++;
                console.warn(`Region "${region.region}" (${region.cloud_provider}) has invalid coordinates: ${region.latitude}, ${region.longitude}`);
            } else {
                validCoordinates++;
            }
        });
        
        console.log(`Loaded ${regionsData.length} regions:`);
        console.log(`  - ${validCoordinates} with valid coordinates`);
        console.log(`  - ${missingCoordinates} missing coordinates`);
        console.log(`  - ${invalidCoordinates} with invalid coordinates`);
        
        if (validCoordinates === 0) {
            console.warn('No regions with valid coordinates found! Markers will not be displayed.');
        }
    } catch (error) {
        console.error('Error loading regions data:', error);
        alert(t('alert_load_fail'));
    }
}

// Setup event listeners
function setupEventListeners() {
    // View mode buttons
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchView(mode);
        });
    });

    // Filter selects and input
    document.getElementById('siteFilter').addEventListener('change', applyFilters);
    document.getElementById('cloudProviderFilter').addEventListener('change', applyFilters);
    document.getElementById('channelFilter').addEventListener('change', applyFilters);
    document.getElementById('regionFilter').addEventListener('input', applyFilters);

    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        if (languageSelect.value !== currentLang) {
            languageSelect.value = currentLang;
        }
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Globe style selector
    const styleSelect = document.getElementById('globeStyleSelect');
    if (styleSelect) {
        styleSelect.addEventListener('change', (e) => {
            currentGlobeStyle = e.target.value;
            if (currentViewMode === 'globe') {
                initGlobe(true); // force re-init
            }
        });
    }

    // Close overlapping markers popup
    const closePopupBtn = document.getElementById('close-overlapping-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            hideOverlappingMarkersPopup();
        });
    }

    // Region modal close actions
    if (regionModalClose) {
        regionModalClose.addEventListener('click', hideRegionModal);
    }
    if (regionModalBackdrop) {
        regionModalBackdrop.addEventListener('click', hideRegionModal);
    }
    window.addEventListener('resize', handleResponsiveSidebar);

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('overlapping-markers-popup');
        if (popup && !popup.contains(e.target) && !popup.classList.contains('hidden')) {
            // Don't close if clicking on markers or popup
            const isMarkerClick = e.target.closest('.custom-marker') || 
                                  e.target.closest('#globe-canvas') ||
                                  e.target.closest('#overlapping-markers-popup');
            if (!isMarkerClick) {
                hideOverlappingMarkersPopup();
            }
        }
    });

    // Keep popup visible when mouse enters it
    const popup = document.getElementById('overlapping-markers-popup');
    if (popup) {
        popup.addEventListener('mouseenter', () => {
            // Cancel any pending hide operations
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        });
        
        popup.addEventListener('mouseleave', (e) => {
            // Schedule hide when mouse leaves the popup
            if (hoverTimeout) clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                hideOverlappingMarkersPopup();
            }, 300);
        });
    }
}

// Setup region modal references
function setupRegionModal() {
    regionModal = document.getElementById('region-modal');
    regionModalClose = document.getElementById('region-modal-close');
    regionModalBackdrop = document.getElementById('region-modal-backdrop');
    regionModalBody = document.getElementById('region-modal-body');
    handleResponsiveSidebar();
}

function showRegionModal(html) {
    if (!regionModal || !regionModalBody) return;
    regionModalBody.innerHTML = html;
    regionModal.classList.remove('hidden');
}

function hideRegionModal() {
    if (regionModal) {
        regionModal.classList.add('hidden');
    }
}

// Ensure sidebar hidden on mobile (use modal) and shown on desktop (non-table)
function handleResponsiveSidebar() {
    const sidebar = document.getElementById('region-info-sidebar');
    if (!sidebar) return;
    if (isMobile() || currentViewMode === 'table') {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
    }
}

// Helper function to normalize obcloud_site (can be string or array)
function getObcloudSites(region) {
    if (!region.obcloud_site) return [];
    if (Array.isArray(region.obcloud_site)) {
        return region.obcloud_site;
    }
    return [region.obcloud_site];
}

// Format AZ code by stripping region_code-related prefixes.
// Handles finance regions where AZs may omit the "finance" segment:
//   region_code: cn-hangzhou-finance, az: cn-hangzhou-b -> b
//   region_code: cn-shanghai-finance-1, az: cn-shanghai-1a -> 1a
function formatAzName(region, az) {
    if (!az || !region || !region.region_code) return az;

    const prefixes = new Set();
    const rc = region.region_code;
    prefixes.add(rc);

    // Try removing "-finance" and "-finance-" variants to cover special AZ coding
    if (rc.includes('finance')) {
        prefixes.add(rc.replace('-finance-', '-'));
        prefixes.add(rc.replace('-finance', ''));
    }

    for (const prefix of prefixes) {
        if (az.startsWith(prefix)) {
            let name = az.slice(prefix.length);
            while (name.startsWith('-')) {
                name = name.slice(1);
            }
            return name || az;
        }
    }

    return az;
}

// Initialize filter dropdowns
function initializeFilters() {
    // Save current selections if any
    const currentSite = document.getElementById('siteFilter') ? document.getElementById('siteFilter').value : '';
    const currentProvider = document.getElementById('cloudProviderFilter') ? document.getElementById('cloudProviderFilter').value : '';
    const currentChannel = document.getElementById('channelFilter') ? document.getElementById('channelFilter').value : '';
    const currentRegion = document.getElementById('regionFilter') ? document.getElementById('regionFilter').value : '';

    const cloudProviders = [...new Set(regionsData.map(r => r.cloud_provider))].sort();
    const regions = [...new Set(regionsData.map(r => r.region))].sort();
    
    // Get all unique channels from all regions
    const allChannels = new Set();
    regionsData.forEach(region => {
        if (region.channels && Array.isArray(region.channels)) {
            region.channels.forEach(channel => allChannels.add(channel));
        }
    });
    const channels = [...allChannels].sort();
    
    // Get all unique sites from all regions
    const allSites = new Set();
    regionsData.forEach(region => {
        const sites = getObcloudSites(region);
        sites.forEach(site => allSites.add(site));
    });
    const sites = [...allSites].sort();

    // Initialize site filter
    const siteSelect = document.getElementById('siteFilter');
    siteSelect.innerHTML = `<option value="">${t('filter_all_sites')}</option>`;
    sites.forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = t(site);
        siteSelect.appendChild(option);
    });
    if (currentSite) siteSelect.value = currentSite;

    // Initialize cloud provider filter
    const cloudProviderSelect = document.getElementById('cloudProviderFilter');
    cloudProviderSelect.innerHTML = `<option value="">${t('filter_all_providers')}</option>`;
    cloudProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = t(provider);
        cloudProviderSelect.appendChild(option);
    });
    if (currentProvider) cloudProviderSelect.value = currentProvider;

    // Initialize channel filter
    const channelSelect = document.getElementById('channelFilter');
    channelSelect.innerHTML = `<option value="">${t('filter_all_channels')}</option>`;
    channels.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel;
        option.textContent = t(channel);
        channelSelect.appendChild(option);
    });
    if (currentChannel) channelSelect.value = currentChannel;

    // Initialize region filter with datalist for search
    const regionDatalist = document.getElementById('regionOptions');
    regionDatalist.innerHTML = '';
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = t(region); // Show translated value in datalist
        regionDatalist.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const siteFilter = document.getElementById('siteFilter').value;
    const cloudProviderFilter = document.getElementById('cloudProviderFilter').value;
    const channelFilter = document.getElementById('channelFilter').value;
    const regionFilter = document.getElementById('regionFilter').value.trim();

    filteredRegions = regionsData.filter(region => {
        // Match site (check if region has the selected site)
        const regionSites = getObcloudSites(region);
        const matchSite = !siteFilter || regionSites.includes(siteFilter);
        
        // Match cloud provider
        const matchProvider = !cloudProviderFilter || region.cloud_provider === cloudProviderFilter;
        
        // Match channel (check if region has the selected channel)
        const matchChannel = !channelFilter || 
            (region.channels && Array.isArray(region.channels) && region.channels.includes(channelFilter));
        
        // Match region with fuzzy search (case-insensitive)
        const matchRegion = !regionFilter || 
            t(region.region).toLowerCase().includes(regionFilter.toLowerCase());
        
        return matchSite && matchProvider && matchChannel && matchRegion;
    });

    updateCurrentView();
}

// Switch view mode
function switchView(mode) {
    currentViewMode = mode;

    // Reset selected region and sidebar to empty state
    selectedRegion = null;
    resetSidebar();

    // Update button states
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update main layout for full width in table mode
    const mainElement = document.querySelector('main');
    if (mainElement) {
        if (mode === 'table') {
            mainElement.classList.add('full-width');
        } else {
            mainElement.classList.remove('full-width');
        }
    }

    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`${mode}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Show/hide sidebar based on view mode
    const sidebar = document.getElementById('region-info-sidebar');
    handleResponsiveSidebar();

    // Initialize view if not already initialized
    if (mode === 'globe' && !currentGlobe) {
        initGlobe();
    } else if (mode === 'map' && !amapMap) {
        initMap();
    }

    updateCurrentView();
}

// Update current view with filtered data
function updateCurrentView() {
    if (currentViewMode === 'globe') {
        updateGlobe();
    } else if (currentViewMode === 'map') {
        updateMap();
    } else if (currentViewMode === 'table') {
        updateTable();
    }
}

// Initialize 3D Globe
function initGlobe(force = false) {
    const container = document.getElementById('globe-canvas');
    if (!container) return;
    
    if (currentGlobe && !force) {
        return;
    }

    if (currentGlobe) {
        currentGlobe.destroy();
        currentGlobe = null;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('globe-loading');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }

    const config = {
        onClick: handleGlobeClick
    };

    if (currentGlobeStyle === 'github') {
        currentGlobe = new GithubGlobe('globe-canvas', config);
    } else {
        currentGlobe = new ClassicGlobe('globe-canvas', config);
    }

    currentGlobe.init().then(() => {
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        updateGlobe();
    });
}

// Update Globe with markers
function updateGlobe() {
    if (!currentGlobe) return;
    const activeRegions = filteredRegions.filter(region => !region.is_offline);
    currentGlobe.addMarkers(activeRegions);
    updateGlobeLegend(activeRegions);
}

// Handle Globe Click (from Globe implementation)
function handleGlobeClick(intersects, clientX, clientY) {
    const uniqueMarkerGroups = new Set();
    const clickedRegions = [];

    intersects.forEach(intersect => {
        let obj = intersect.object;
        while (obj) {
            // Check if this is a marker group (has region data)
            if (obj.userData && obj.userData.region) {
                 if (!uniqueMarkerGroups.has(obj)) {
                     uniqueMarkerGroups.add(obj);
                     const region = obj.userData.region;
                     // Avoid duplicates
                     if (!clickedRegions.find(r => r.region === region.region && r.cloud_provider === region.cloud_provider)) {
                         clickedRegions.push(region);
                     }
                 }
                 break;
            }
            obj = obj.parent;
        }
    });

    if (clickedRegions.length === 1) {
        showRegionInfo(clickedRegions[0]);
    } else if (clickedRegions.length > 1) {
        showOverlappingMarkersPopup(clickedRegions, clientX, clientY);
    }
}

// Update Globe legend with cloud providers
function updateGlobeLegend(regions = filteredRegions) {
    const legend = document.getElementById('globe-legend');
    if (!legend || regions.length === 0) return;

    // Get unique cloud providers from filtered regions
    const providers = [...new Set(regions.map(r => r.cloud_provider))].sort();
    
    // Clear existing legend items
    legend.innerHTML = '';
    
    // Add title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'legend-title';
    titleDiv.textContent = t('legend_cloud_provider');
    legend.appendChild(titleDiv);

    // Add legend items for each provider
    providers.forEach(provider => {
        const config = getCloudProviderConfig(provider);
        const colorHex = '#' + config.color.toString(16).padStart(6, '0');
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-color" style="background: ${colorHex};"></span>
            <span>${getLegendLabel(provider)}</span>
        `;
        legend.appendChild(item);
    });
}

// Initialize Map view (AMap)
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Clear container when switching providers
    mapContainer.innerHTML = '';

    // AMap path
    if (!isAMapLoaded || typeof AMap === 'undefined') {
        if (mapContainer && mapContainer.innerHTML === '') {
            mapContainer.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666;">${t('loading_amap')}</div>`;
        }
        return;
    }

    initializeAMap();
}

// Recreate 高德地图 with the given language (AMap v2 lacks setLang, so recreate)
function recreateAMap(lang) {
    if (!isAMapLoaded || typeof AMap === 'undefined') return;

    try {
        const langCode = lang === 'zh' ? 'zh_cn' : 'en';

        // Preserve current view if map already exists
        const zoom = amapMap ? amapMap.getZoom() : 2;
        const centerLngLat = amapMap ? amapMap.getCenter() : new AMap.LngLat(0, 20);

        // Destroy old instance to avoid leaks
        if (amapMap && typeof amapMap.destroy === 'function') {
            amapMap.destroy();
        }

        amapMap = new AMap.Map('map', {
            zoom,
            center: centerLngLat,
            viewMode: '3D',
            mapStyle: 'amap://styles/normal',
            lang: langCode
        });

        // Expose map instance globally for potential future hooks
        window.amapMap = amapMap;

        // Re-render markers
        updateMap();
    } catch (error) {
        console.error('高德地图初始化失败:', error);
        document.getElementById('map').innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; flex-direction: column; gap: 1rem;"><div>${t('amap_fail')}</div><div style="font-size: 0.9rem;">${t('check_console')}</div></div>`;
    }
}

// Initialize 高德地图 instance
function initializeAMap() {
    recreateAMap(currentLang);
}

function getMapTilerKey() {
    if (typeof MAPTILER_API_KEY !== 'undefined') return MAPTILER_API_KEY;
    if (typeof window !== 'undefined' && typeof window.MAPTILER_API_KEY !== 'undefined') return window.MAPTILER_API_KEY;
    return undefined;
}

// (MapLibre removed)

function updateMap() {
    if (!amapMap) return;

    // Clear existing markers
    amapMarkers.forEach(marker => {
        amapMap.remove(marker);
    });
    amapMarkers = [];

    // Add markers for filtered regions
    let markersAdded = 0;
    let markersSkipped = 0;

    const activeRegions = filteredRegions.filter(region => !region.is_offline);
    const offlineCount = filteredRegions.length - activeRegions.length;

    activeRegions.forEach(region => {
        // Validate coordinates
        if (!region.latitude || !region.longitude) {
            console.warn(`Region ${region.region} missing coordinates`);
            markersSkipped++;
            return;
        }

        // Validate coordinate ranges
        if (region.latitude < -90 || region.latitude > 90 || 
            region.longitude < -180 || region.longitude > 180) {
            console.warn(`Region ${region.region} has invalid coordinates: ${region.latitude}, ${region.longitude}`);
            markersSkipped++;
            return;
        }

        // Get cloud provider color configuration
        const providerConfig = getCloudProviderConfig(region.cloud_provider);
        const providerColorHex = '#' + providerConfig.color.toString(16).padStart(6, '0');
        
        // Create custom marker icon with cloud provider color
        const markerContent = document.createElement('div');
        markerContent.className = 'custom-marker';
        markerContent.title = `${t(region.region)} (${t(region.cloud_provider)})`;
        markerContent.style.cssText = `
            background: ${providerColorHex};
            border: 3px solid white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        
        // Add hover effect
        markerContent.addEventListener('mouseenter', () => {
            // Cancel any pending popup hide
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            // Check if we need to close an existing popup from a DIFFERENT group
            const popup = document.getElementById('overlapping-markers-popup');
            if (popup && !popup.classList.contains('hidden') && popup.dataset.activeRegions) {
                try {
                    const activeRegions = JSON.parse(popup.dataset.activeRegions);
                    const currentId = `${region.cloud_provider}:${region.region}`;
                    if (!activeRegions.includes(currentId)) {
                        hideOverlappingMarkersPopup();
                    }
                } catch (e) {
                    // ignore parse error
                }
            }

            markerContent.style.transform = 'scale(1.3)';
            markerContent.style.boxShadow = `0 4px 12px ${providerColorHex}80`;
            
            // Check for overlapping markers on hover (geo then screen)
            const markerPos = marker.getPosition();
            const pixel = amapMap.lngLatToContainer(markerPos);
            const overlapGroup = findOverlappingMarkers(marker, region, pixel);
            if (overlapGroup.length > 0) {
                const regions = [region, ...overlapGroup.map(m => m.userData.region)];
                const container = amapMap.getContainer();
                const rect = container.getBoundingClientRect();
                setTimeout(() => {
                    showOverlappingMarkersPopup(regions, rect.left + pixel.x, rect.top + pixel.y);
                }, 300);
            }
        });
        markerContent.addEventListener('mouseleave', () => {
            markerContent.style.transform = 'scale(1)';
            markerContent.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            
            // If popup is visible, schedule hide
            const popup = document.getElementById('overlapping-markers-popup');
            if (popup && !popup.classList.contains('hidden')) {
                if (hoverTimeout) clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    hideOverlappingMarkersPopup();
                }, 300);
            }
        });
        
        // Create marker
        const marker = new AMap.Marker({
            position: [region.longitude, region.latitude],
            content: markerContent,
            offset: new AMap.Pixel(-12, -12),
            title: t(region.region)
        });

        // Store region data for selection
        marker.userData = { region: region };

        // Store marker position for overlap detection
        marker.userData.position = [region.longitude, region.latitude];

        const handleMarkerSelect = () => {
            // Get marker position in container pixels
            const markerPos = marker.getPosition();
            const pixel = amapMap.lngLatToContainer(markerPos);
            
            // Collect markers that overlap on geo or screen
            const overlapGroup = findOverlappingMarkers(marker, region, pixel);

            if (overlapGroup.length > 0) {
                // Multiple markers nearby, show popup
                const regions = [region, ...overlapGroup.map(m => m.userData.region)];
                // Get container coordinates relative to viewport
                const container = amapMap.getContainer();
                const rect = container.getBoundingClientRect();
                showOverlappingMarkersPopup(regions, rect.left + pixel.x, rect.top + pixel.y);
            } else {
                // Single marker, show info directly
                showRegionInfo(region);
                // Ensure any overlapping popup is hidden
                hideOverlappingMarkersPopup();
            }
        };

        // Add click / touchend events - ensure mobile taps also trigger
        marker.on('click', handleMarkerSelect);
        marker.on('touchend', handleMarkerSelect);

        // Add to map
        marker.setMap(amapMap);
        amapMarkers.push(marker);
        markersAdded++;
    });

    console.log(`Map: Added ${markersAdded} markers, skipped ${markersSkipped} (missing/invalid coordinates), filtered offline: ${offlineCount}`);
}

// Create popup content for map markers
function createPopupContent(region) {
    const azCount = Array.isArray(region.availability_zones) ? region.availability_zones.length : t(region.availability_zones || '-');
    return `
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 0.5rem 0; color: #667eea;">${t(region.region)}</h3>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>${t('label_provider')}:</strong> ${t(region.cloud_provider)}</p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>${t('label_az')}:</strong> ${azCount}</p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>${t('label_date')}:</strong> ${t(region.launch_date)}</p>
        </div>
    `;
}

// Sync horizontal scroll between header and body wrappers
function setupTableScrollSync() {
    if (tableScrollSynced) return;

    const headerWrapper = document.querySelector('.table-header-wrapper');
    const bodyWrapper = document.querySelector('.table-body-wrapper');

    if (!headerWrapper || !bodyWrapper) return;

    const syncFromBody = () => {
        headerWrapper.scrollLeft = bodyWrapper.scrollLeft;
    };
    const syncFromHeader = () => {
        bodyWrapper.scrollLeft = headerWrapper.scrollLeft;
    };

    bodyWrapper.addEventListener('scroll', syncFromBody);
    headerWrapper.addEventListener('scroll', syncFromHeader);
    tableScrollSynced = true;
}

// Sync column widths between header and body tables
function syncTableColumnWidths() {
    const headerTable = document.getElementById('regions-table-header');
    const bodyTable = document.getElementById('regions-table');
    
    if (!headerTable || !bodyTable) return;
    
    const headerCells = headerTable.querySelectorAll('thead th');
    if (headerCells.length === 0) return;
    
    // Get all body rows
    const bodyRows = bodyTable.querySelectorAll('tbody tr');
    if (bodyRows.length === 0) return;
    
    // Calculate and set widths for each column
    headerCells.forEach((headerCell, index) => {
        const width = headerCell.offsetWidth;
        headerCell.style.width = width + 'px';
        headerCell.style.minWidth = width + 'px';
        headerCell.style.maxWidth = width + 'px';
        
        // Apply to all cells in this column
        bodyRows.forEach(row => {
            const cell = row.querySelector(`td:nth-child(${index + 1})`);
            if (cell) {
                cell.style.width = width + 'px';
                cell.style.minWidth = width + 'px';
                cell.style.maxWidth = width + 'px';
            }
        });
    });
}

// Update Table view
function updateTable() {
    const tbody = document.getElementById('regions-table-body');
    tbody.innerHTML = '';

    if (filteredRegions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">${t('no_match')}</td></tr>`;
        // Sync widths even for empty table
        setTimeout(syncTableColumnWidths, 0);
        return;
    }

    filteredRegions.forEach(region => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.region = region.region;
        row.dataset.provider = region.cloud_provider;
        row.addEventListener('click', () => {
            // In table view, just highlight the row, don't show sidebar
            if (currentViewMode === 'table') {
                // Remove selection from other rows
                document.querySelectorAll('#regions-table-body tr').forEach(r => {
                    r.classList.remove('selected');
                });
                row.classList.add('selected');
            } else {
                showRegionInfo(region);
            }
        });

        const channels = Array.isArray(region.channels) ? region.channels : [];
        const channelsHtml = channels.map(ch => 
            `<span class="channel-tag">${t(ch)}</span>`
        ).join('');
        
        const sites = getObcloudSites(region);
        const sitesHtml = sites.length > 0 
            ? sites.map(site => `<span class="channel-tag">${t(site)}</span>`).join('')
            : '-';

        const isOffline = region.is_offline === true;
        const azCount = isOffline ? '-' : (Array.isArray(region.availability_zones) ? region.availability_zones.length : t(region.availability_zones || '-'));
        const azList = isOffline ? '' : (
            Array.isArray(region.availability_zones) 
                ? region.availability_zones.map(az => formatAzName(region, az)).join(', ')
                : t(region.availability_zones || '-')
        );
        const launchDate = isOffline ? t('offline_status') : t(region.launch_date);

        row.innerHTML = `
            <td>${t(region.cloud_provider)}</td>
            <td>${t(region.region)}</td>
            <td>${region.region_code || '-'}</td>
            <td>${azCount}</td>
            <td>${azList}</td>
            <td>${launchDate}</td>
            <td><div class="channels">${channelsHtml}</div></td>
            <td>${sites.length > 0 ? `<div class="channels">${sitesHtml}</div>` : '-'}</td>
        `;

        tbody.appendChild(row);
    });
    
    // Sync column widths after table is updated
    setTimeout(syncTableColumnWidths, 0);

    // Keep header/body horizontal scroll aligned
    const headerWrapper = document.querySelector('.table-header-wrapper');
    const bodyWrapper = document.querySelector('.table-body-wrapper');
    if (headerWrapper && bodyWrapper) {
        headerWrapper.scrollLeft = bodyWrapper.scrollLeft;
    }
}

// Reset sidebar to empty state
function resetSidebar() {
    const content = document.getElementById('region-info-content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <p data-i18n="sidebar_empty">${t('sidebar_empty')}</p>
        </div>
    `;

    // Reset selected state in all views
    resetSelectedState();
}

// Reset selected state in all views
function resetSelectedState() {
    // Reset table row selection
    const tableRows = document.querySelectorAll('#regions-table-body tr');
    tableRows.forEach(row => {
        row.classList.remove('selected');
    });

    // Reset Globe markers
    if (currentGlobe && currentGlobe.markers) {
        currentGlobe.markers.forEach(markerGroup => {
            if (markerGroup.userData && markerGroup.userData.markerMesh) {
                markerGroup.userData.isSelected = false;
                markerGroup.userData.markerMesh.material.emissiveIntensity = 0.5;
            }
        });
    }

    // Reset Map markers (AMap)
    amapMarkers.forEach(marker => {
        const content = marker.getContent();
        if (content) {
            content.style.transform = 'scale(1)';
            content.style.borderWidth = '3px';
            content.style.zIndex = 'auto';
        }
    });

    // Reset MapLibre markers (no selection styling applied)
}

// Show region info in sidebar
function showRegionInfo(region) {
    // Ensure any overlapping popup is hidden whenever a region is selected
    hideOverlappingMarkersPopup();

    selectedRegion = region;

    const providerConfig = getCloudProviderConfig(region.cloud_provider);
    const providerColorHex = '#' + providerConfig.color.toString(16).padStart(6, '0');

    const channelsHtml = region.channels.map(ch => 
        `<span class="channel-tag">${t(ch)}</span>`
    ).join('');
    
    const sites = getObcloudSites(region);
    const sitesHtml = sites.length > 0 
        ? sites.map(site => `<span class="channel-tag">${t(site)}</span>`).join('')
        : '-';

    const infoHtml = `
        <h3 style="color: ${providerColorHex};">${t(region.region)}</h3>
        <div class="info-item">
            <label>${t('label_provider')}</label>
            <div class="value">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${providerColorHex}; border-radius: 50%; margin-right: 0.5rem; vertical-align: middle;"></span>
                ${t(region.cloud_provider)}
            </div>
        </div>
        <div class="info-item">
            <label>${t('label_code')}</label>
            <div class="value">${region.region_code || '-'}</div>
        </div>
        <div class="info-item">
            <label>${t('label_az')}</label>
            <div class="value">${Array.isArray(region.availability_zones) ? region.availability_zones.length : t(region.availability_zones || '-')}</div>
        </div>
        ${(Array.isArray(region.availability_zones) || region.availability_zones) ? `
        <div class="info-item">
            <label>${t('label_az_list')}</label>
            <div class="value">${Array.isArray(region.availability_zones) ? region.availability_zones.map(az => formatAzName(region, az)).join(', ') : t(region.availability_zones)}</div>
        </div>
        ` : ''}
        <div class="info-item">
            <label>${t('label_date')}</label>
            <div class="value">${t(region.launch_date)}</div>
        </div>
        <div class="info-item">
            <label>${t('label_channels')}</label>
            <div class="value">
                <div class="channels">${channelsHtml}</div>
            </div>
        </div>
        <div class="info-item">
            <label>${t('label_sites')}</label>
            <div class="value">
                ${sites.length > 0 ? `<div class="channels">${sitesHtml}</div>` : '-'}
            </div>
        </div>
    `;

    // Render to sidebar (desktop) or modal (mobile / sidebar hidden)
    if (shouldUseModal()) {
        showRegionModal(infoHtml);
    } else {
        const content = document.getElementById('region-info-content');
        if (content) {
            content.innerHTML = infoHtml;
        }
    }

    // Update selected state in views
    updateSelectedState(region);
}

// Update selected state in all views
function updateSelectedState(region) {
    // Update table row selection
    const tableRows = document.querySelectorAll('#regions-table-body tr');
    tableRows.forEach(row => {
        row.classList.remove('selected');
        // Check if this row corresponds to the selected region
        if (row.dataset.region === region.region && row.dataset.provider === region.cloud_provider) {
            row.classList.add('selected');
        }
    });

    // Update Globe markers - highlight selected
    if (currentGlobe && currentGlobe.markers) {
        currentGlobe.markers.forEach(markerGroup => {
            if (markerGroup.userData && markerGroup.userData.region) {
                const isSelected = markerGroup.userData.region.region === region.region &&
                                   markerGroup.userData.region.cloud_provider === region.cloud_provider;
                
                // Store selection state for scale calculation in animate loop
                markerGroup.userData.isSelected = isSelected;
                
                if (markerGroup.userData.markerMesh) {
                    if (isSelected) {
                        // Make selected marker brighter
                        markerGroup.userData.markerMesh.material.emissiveIntensity = 1.0;
                    } else {
                        // Reset to normal brightness
                        markerGroup.userData.markerMesh.material.emissiveIntensity = 0.5;
                    }
                }
            }
        });
    }

    // Update Map markers - highlight selected
    amapMarkers.forEach(marker => {
        if (marker.userData && marker.userData.region) {
            const isSelected = marker.userData.region.region === region.region &&
                               marker.userData.region.cloud_provider === region.cloud_provider;
            
            const content = marker.getContent();
            if (content) {
                if (isSelected) {
                    content.style.transform = 'scale(1.4)';
                    content.style.borderWidth = '4px';
                    content.style.zIndex = '1000';
                } else {
                    content.style.transform = 'scale(1)';
                    content.style.borderWidth = '3px';
                    content.style.zIndex = 'auto';
                }
            }
        }
    });
}

// Show overlapping markers popup
function showOverlappingMarkersPopup(regions, x, y) {
    const popup = document.getElementById('overlapping-markers-popup');
    if (!popup) return;

    const list = document.getElementById('overlapping-markers-list');
    if (!list) return;

    // Clear previous content
    list.innerHTML = '';

    // Add marker items
    const regionIds = regions.map(r => `${r.cloud_provider}:${r.region}`);
    popup.dataset.activeRegions = JSON.stringify(regionIds);

    regions.forEach(region => {
        const providerConfig = getCloudProviderConfig(region.cloud_provider);
        const providerColorHex = '#' + providerConfig.color.toString(16).padStart(6, '0');

        const item = document.createElement('div');
        item.className = 'overlapping-marker-item';
        item.innerHTML = `
            <span class="overlapping-marker-color" style="background: ${providerColorHex};"></span>
            <div class="overlapping-marker-info">
                <div class="overlapping-marker-name">${t(region.region)}</div>
                <div class="overlapping-marker-provider">${t(region.cloud_provider)}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            showRegionInfo(region);
            hideOverlappingMarkersPopup();
        });
        list.appendChild(item);
    });

    // Position popup near click position
    popup.classList.remove('hidden');
    popup.style.visibility = 'hidden';
    popup.style.left = '0px';
    popup.style.top = '0px';

    const rect = popup.getBoundingClientRect();
    const defaultLeft = x + 10;
    const defaultTop = y + 10;
    const maxLeft = Math.max(10, window.innerWidth - rect.width - 10);
    const maxTop = Math.max(10, window.innerHeight - rect.height - 10);
    const clampedLeft = Math.min(Math.max(10, defaultLeft), maxLeft);
    const clampedTop = Math.min(Math.max(10, defaultTop), maxTop);

    popup.style.left = `${clampedLeft}px`;
    popup.style.top = `${clampedTop}px`;
    popup.style.visibility = 'visible';
    popup.dataset.isVisible = 'true';
}

// Hide overlapping markers popup
function hideOverlappingMarkersPopup() {
    const popup = document.getElementById('overlapping-markers-popup');
    if (popup) {
        popup.classList.add('hidden');
        popup.dataset.isVisible = 'false';
    }
}

// Check if mouse is over popup
function isMouseOverPopup(mouseX, mouseY) {
    const popup = document.getElementById('overlapping-markers-popup');
    if (!popup || popup.classList.contains('hidden')) {
        return false;
    }
    const rect = popup.getBoundingClientRect();
    return mouseX >= rect.left && mouseX <= rect.right &&
           mouseY >= rect.top && mouseY <= rect.bottom;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

