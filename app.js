// Global state
let regionsData = [];
let filteredRegions = [];
let currentViewMode = 'globe';
let selectedRegion = null;
let overlappingMarkersPopup = null;
let hoverTimeout = null; // Global hover timeout for popup management

// Three.js Globe components
let globeScene, globeCamera, globeRenderer, globeMesh;
let globeMarkers = [];

// 高德地图 components
let amapMap;
let amapMarkers = [];

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

// Initialize application
async function init() {
    await loadRegionsData();
    setupEventListeners();
    initializeFilters();
    // Initialize sidebar to empty state
    resetSidebar();
    switchView('globe');
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
        alert('无法加载地域数据，请检查 data/ 目录下的 YAML 文件');
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

    // Filter selects
    document.getElementById('cloudProviderFilter').addEventListener('change', applyFilters);
    document.getElementById('regionFilter').addEventListener('change', applyFilters);

    // Close overlapping markers popup
    const closePopupBtn = document.getElementById('close-overlapping-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            hideOverlappingMarkersPopup();
        });
    }

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
            // Only hide if mouse is not moving to a marker
            const relatedTarget = e.relatedTarget;
            if (relatedTarget && !relatedTarget.closest('.custom-marker') && 
                !relatedTarget.closest('#globe-canvas')) {
                // Small delay before hiding to allow moving back
                setTimeout(() => {
                    if (!isMouseOverPopup(e.clientX, e.clientY)) {
                        hideOverlappingMarkersPopup();
                    }
                }, 200);
            }
        });
    }
}

// Initialize filter dropdowns
function initializeFilters() {
    const cloudProviders = [...new Set(regionsData.map(r => r.cloud_provider))].sort();
    const regions = [...new Set(regionsData.map(r => r.region))].sort();

    const cloudProviderSelect = document.getElementById('cloudProviderFilter');
    cloudProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        cloudProviderSelect.appendChild(option);
    });

    const regionSelect = document.getElementById('regionFilter');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const cloudProviderFilter = document.getElementById('cloudProviderFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;

    filteredRegions = regionsData.filter(region => {
        const matchProvider = !cloudProviderFilter || region.cloud_provider === cloudProviderFilter;
        const matchRegion = !regionFilter || region.region === regionFilter;
        return matchProvider && matchRegion;
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
    if (sidebar) {
        if (mode === 'table') {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
        }
    }

    // Initialize view if not already initialized
    if (mode === 'globe' && !globeRenderer) {
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
function initGlobe() {
    const container = document.getElementById('globe-canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    globeScene = new THREE.Scene();
    globeScene.background = new THREE.Color(0x0a0e27);

    // Camera
    globeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    globeCamera.position.z = 300;

    // Renderer
    globeRenderer = new THREE.WebGLRenderer({ antialias: true });
    globeRenderer.setSize(width, height);
    container.appendChild(globeRenderer.domElement);

    // Earth geometry
    const geometry = new THREE.SphereGeometry(100, 64, 64);
    
    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    
    // Earth material - will be updated when texture loads
    const material = new THREE.MeshPhongMaterial({
        shininess: 30,
        specular: new THREE.Color(0x222222)
    });
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('globe-loading');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    
    // Try multiple texture sources for reliability
    // Priority: local file first, then remote fallbacks
    const textureUrls = [
        'assets/earth_atmos_2048.jpg',  // Local file (fastest)
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
        'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg'
    ];
    
    let textureLoaded = false;
    let currentTextureIndex = 0;
    
    // Function to hide loading indicator
    function hideLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
    
    function tryLoadTexture(index) {
        if (index >= textureUrls.length) {
            // All textures failed, use color fallback
            console.warn('All Earth texture sources failed, using color fallback');
            material.color.setHex(0x2233ff);
            hideLoadingIndicator();
            return;
        }
        
        textureLoader.load(
            textureUrls[index],
            (texture) => {
                if (!textureLoaded) {
                    textureLoaded = true;
                    material.map = texture;
                    material.needsUpdate = true;
                    console.log('Earth texture loaded from source', index + 1);
                    hideLoadingIndicator();
                }
            },
            undefined,
            (error) => {
                console.warn(`Texture source ${index + 1} failed, trying next...`);
                tryLoadTexture(index + 1);
            }
        );
    }
    
    // Start loading texture
    tryLoadTexture(0);
    
    globeMesh = new THREE.Mesh(geometry, material);

    globeScene.add(globeMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    globeScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    globeScene.add(directionalLight);

    // Auto-rotation control
    let autoRotate = true;  // Enable auto-rotation by default
    let lastAutoRotateTime = Date.now();
    
    // Function to stop auto-rotation
    function stopAutoRotate() {
        autoRotate = false;
    }

    // Controls (mouse interaction)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseDownPosition = { x: 0, y: 0 };

    globeRenderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        mouseDownPosition = { x: e.clientX, y: e.clientY };
        stopAutoRotate();  // Stop auto-rotation on mouse down
    });

    globeRenderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            stopAutoRotate();  // Stop auto-rotation when dragging
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            globeMesh.rotation.y += deltaX * 0.01;
            globeMesh.rotation.x += deltaY * 0.01;
            
            // Hide popup when dragging (unless mouse is over popup)
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            if (!isMouseOverPopup(e.clientX, e.clientY)) {
                hideOverlappingMarkersPopup();
            }
        } else {
            // Don't check if mouse is over popup
            if (isMouseOverPopup(e.clientX, e.clientY)) {
                return;
            }
            
            // Clear previous timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            // Check for overlapping markers on hover after a short delay
            hoverTimeout = setTimeout(() => {
                // Double check mouse is not over popup before checking
                if (!isMouseOverPopup(e.clientX, e.clientY)) {
                    checkGlobeMarkerOverlaps(e.clientX, e.clientY);
                }
            }, 300); // 300ms delay to avoid flickering
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    globeRenderer.domElement.addEventListener('mouseup', (e) => {
        stopAutoRotate();  // Stop auto-rotation on any mouse interaction
        
        // Check if it was a click (not a drag)
        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - mouseDownPosition.x, 2) + 
            Math.pow(e.clientY - mouseDownPosition.y, 2)
        );
        
        if (dragDistance < 5) {
            // It was a click, check for marker intersection
            const mouse = new THREE.Vector2();
            const rect = globeRenderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, globeCamera);

            // Check intersection with markers (check all children too)
            const allMarkerObjects = [];
            globeMarkers.forEach(markerGroup => {
                allMarkerObjects.push(markerGroup);
                markerGroup.children.forEach(child => allMarkerObjects.push(child));
            });
            
            const intersects = raycaster.intersectObjects(allMarkerObjects, true);
            if (intersects.length > 0) {
                // Collect unique marker groups (not individual objects)
                const uniqueMarkerGroups = new Set();
                const clickedMarkers = [];
                
                intersects.forEach(intersect => {
                    let obj = intersect.object;
                    // Find the markerGroup (top-level parent with region data)
                    while (obj) {
                        // Check if this is a markerGroup (has region data and is in globeMarkers)
                        if (obj.userData && obj.userData.region) {
                            // Check if this is actually a markerGroup, not just a child
                            const isMarkerGroup = globeMarkers.includes(obj);
                            if (isMarkerGroup) {
                                // This is a unique markerGroup
                                if (!uniqueMarkerGroups.has(obj)) {
                                    uniqueMarkerGroups.add(obj);
                                    const region = obj.userData.region;
                                    // Check if region already added
                                    if (!clickedMarkers.find(m => m.region.region === region.region && m.region.cloud_provider === region.cloud_provider)) {
                                        clickedMarkers.push({
                                            markerGroup: obj,
                                            region: region,
                                            distance: intersect.distance
                                        });
                                    }
                                }
                                break;
                            } else {
                                // This is a child, find the parent markerGroup
                                let parent = obj.parent;
                                while (parent) {
                                    if (globeMarkers.includes(parent)) {
                                        if (!uniqueMarkerGroups.has(parent)) {
                                            uniqueMarkerGroups.add(parent);
                                            const region = parent.userData.region;
                                            if (!clickedMarkers.find(m => m.region.region === region.region && m.region.cloud_provider === region.cloud_provider)) {
                                                clickedMarkers.push({
                                                    markerGroup: parent,
                                                    region: region,
                                                    distance: intersect.distance
                                                });
                                            }
                                        }
                                        break;
                                    }
                                    parent = parent.parent;
                                }
                                break;
                            }
                        }
                        obj = obj.parent;
                    }
                });

                if (clickedMarkers.length === 1) {
                    // Single marker clicked, show info directly
                    showRegionInfo(clickedMarkers[0].region);
                } else if (clickedMarkers.length > 1) {
                    // Multiple unique markers clicked, show popup
                    showOverlappingMarkersPopup(clickedMarkers.map(m => m.region), e.clientX, e.clientY);
                }
            }
        }
        
        isDragging = false;
    });

    globeRenderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        stopAutoRotate();  // Stop auto-rotation on wheel zoom
        globeCamera.position.z += e.deltaY * 0.5;
        globeCamera.position.z = Math.max(150, Math.min(500, globeCamera.position.z));
    });

    // Render loop with auto-rotation
    function animate() {
        requestAnimationFrame(animate);
        
        // Auto-rotation: 10 seconds per full rotation (360 degrees)
        if (autoRotate && globeMesh) {
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastAutoRotateTime) / 1000; // Convert to seconds
            lastAutoRotateTime = currentTime;
            
            // Rotate 360 degrees in 10 seconds = 36 degrees per second = 0.628 radians per second
            const rotationSpeed = (2 * Math.PI) / 10; // radians per second
            globeMesh.rotation.y += rotationSpeed * deltaTime;
        }
        
        // Update marker scales based on camera distance to keep them fixed size
        const cameraDistance = globeCamera.position.z;
        const baseDistance = 300; // Base camera distance
        const scaleFactor = cameraDistance / baseDistance;
        
        globeMarkers.forEach(markerGroup => {
            if (markerGroup.userData && markerGroup.userData.markerMesh) {
                // Get base scale (1.0 for normal, 1.3 for selected - matching Map view hover effect)
                const baseScale = markerGroup.userData.isSelected ? 1.3 : 1.0;
                // Keep marker size constant regardless of camera distance
                markerGroup.userData.markerMesh.scale.setScalar(baseScale * scaleFactor);
            }
        });
        
        globeRenderer.render(globeScene, globeCamera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        globeCamera.aspect = width / height;
        globeCamera.updateProjectionMatrix();
        globeRenderer.setSize(width, height);
    });

    updateGlobe();
}

// Update Globe with markers
function updateGlobe() {
    if (!globeScene) return;

    // Remove existing markers
    globeMarkers.forEach(marker => {
        globeMesh.remove(marker);
    });
    globeMarkers = [];

    // Add markers for filtered regions
    let markersAdded = 0;
    let markersSkipped = 0;
    
    filteredRegions.forEach(region => {
        const marker = createGlobeMarker(region);
        if (marker) {
            // Add marker as child of globeMesh so it rotates with the globe
            globeMesh.add(marker);
            globeMarkers.push(marker);
            markersAdded++;
        } else {
            markersSkipped++;
        }
    });

    // Update legend
    updateGlobeLegend();

    console.log(`Globe: Added ${markersAdded} markers, skipped ${markersSkipped} (missing/invalid coordinates)`);
}

// Update Globe legend with cloud providers
function updateGlobeLegend() {
    const legend = document.getElementById('globe-legend');
    if (!legend || filteredRegions.length === 0) return;

    // Get unique cloud providers from filtered regions
    const providers = [...new Set(filteredRegions.map(r => r.cloud_provider))].sort();
    
    // Clear existing legend items
    legend.innerHTML = '';
    
    // Add title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'legend-title';
    titleDiv.textContent = '云厂商';
    legend.appendChild(titleDiv);

    // Add legend items for each provider
    providers.forEach(provider => {
        const config = getCloudProviderConfig(provider);
        const colorHex = '#' + config.color.toString(16).padStart(6, '0');
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-color" style="background: ${colorHex};"></span>
            <span>${config.name}</span>
        `;
        legend.appendChild(item);
    });
}

// Create a marker on the globe
function createGlobeMarker(region) {
    // Validate coordinates
    if (!region.latitude || !region.longitude) {
        console.warn(`Region ${region.region} missing coordinates`);
        return null;
    }

    // Validate coordinate ranges
    if (region.latitude < -90 || region.latitude > 90 || 
        region.longitude < -180 || region.longitude > 180) {
        console.warn(`Region ${region.region} has invalid coordinates: ${region.latitude}, ${region.longitude}`);
        return null;
    }

    // Convert lat/lng to 3D coordinates on sphere surface
    const phi = (90 - region.latitude) * (Math.PI / 180);
    const theta = (region.longitude + 180) * (Math.PI / 180);

    const radius = 100; // Earth radius
    const markerRadius = 100.5; // Slightly above surface for visibility
    
    const x = -(markerRadius * Math.sin(phi) * Math.cos(theta));
    const y = markerRadius * Math.cos(phi);
    const z = markerRadius * Math.sin(phi) * Math.sin(theta);

    // Get cloud provider color configuration
    const providerConfig = getCloudProviderConfig(region.cloud_provider);
    const providerColor = providerConfig.color;
    const darkerColor = providerColor * 0.7; // Darker shade for emissive

    // Create marker group
    const markerGroup = new THREE.Group();
    markerGroup.userData = { region: region };
    markerGroup.position.set(x, y, z);

    // Main marker - simple sphere matching Map view style
    // Map view uses 24px circle, so we use a similar size sphere
    const markerSize = 2.5; // Adjusted to match visual size of 24px circle
    const markerGeometry = new THREE.SphereGeometry(markerSize, 16, 16);
    const markerMaterial = new THREE.MeshPhongMaterial({ 
        color: providerColor,
        emissive: darkerColor,
        emissiveIntensity: 0.3,
        shininess: 50
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    markerGroup.add(marker);
    
    // Store reference for selection highlighting
    markerGroup.userData.markerMesh = marker;

    return markerGroup;
}

// Initialize Map view with 高德地图
function initMap() {
    // Check if AMap is loaded
    if (typeof AMap === 'undefined') {
        // Wait for AMap to load (retry mechanism)
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds max wait
        
        const checkAMap = setInterval(() => {
            retryCount++;
            if (typeof AMap !== 'undefined') {
                clearInterval(checkAMap);
                // AMap loaded, initialize map
                initializeAMap();
            } else if (retryCount >= maxRetries) {
                clearInterval(checkAMap);
                console.error('高德地图 API 加载超时，请检查 API Key 配置和网络连接');
                document.getElementById('map').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; flex-direction: column; gap: 1rem;"><div>高德地图 API 加载超时</div><div style="font-size: 0.9rem;">请检查 config.js 中的 API Key 配置</div></div>';
            }
        }, 100);
        
        return;
    }

    initializeAMap();
}

// Initialize 高德地图 instance
function initializeAMap() {
    try {
        // Initialize 高德地图
        amapMap = new AMap.Map('map', {
            zoom: 2,
            center: [0, 20],
            viewMode: '3D',
            mapStyle: 'amap://styles/normal'
        });

        updateMap();
    } catch (error) {
        console.error('高德地图初始化失败:', error);
        document.getElementById('map').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; flex-direction: column; gap: 1rem;"><div>高德地图初始化失败</div><div style="font-size: 0.9rem;">请检查控制台错误信息</div></div>';
    }
}

// Update Map with markers
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

    filteredRegions.forEach(region => {
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
        markerContent.title = `${region.region} (${region.cloud_provider})`;
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
            markerContent.style.transform = 'scale(1.3)';
            markerContent.style.boxShadow = `0 4px 12px ${providerColorHex}80`;
            
            // Check for overlapping markers on hover
            const markerPos = marker.getPosition();
            const pixel = amapMap.lngLatToContainer(markerPos);
            const nearbyMarkers = amapMarkers.filter(m => {
                if (m === marker) return false;
                if (!m.userData || !m.userData.region) return false;
                const otherPos = m.getPosition();
                const otherPixel = amapMap.lngLatToContainer(otherPos);
                const distance = Math.sqrt(
                    Math.pow(otherPixel.x - pixel.x, 2) + 
                    Math.pow(otherPixel.y - pixel.y, 2)
                );
                return distance < 30; // 30 pixels threshold
            });
            
            if (nearbyMarkers.length > 0) {
                const regions = [region, ...nearbyMarkers.map(m => m.userData.region)];
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
            // Don't hide popup on mouseleave - let user click on it or click outside to close
        });
        
        // Create marker
        const marker = new AMap.Marker({
            position: [region.longitude, region.latitude],
            content: markerContent,
            offset: new AMap.Pixel(-12, -12),
            title: region.region
        });

        // Store region data for selection
        marker.userData = { region: region };

        // Store marker position for overlap detection
        marker.userData.position = [region.longitude, region.latitude];

        // Add click event - check for overlapping markers
        marker.on('click', (e) => {
            // Get marker position in container pixels
            const markerPos = marker.getPosition();
            const pixel = amapMap.lngLatToContainer(markerPos);
            
            // Check for nearby markers (within 30 pixels on screen)
            const nearbyMarkers = amapMarkers.filter(m => {
                if (m === marker) return false;
                if (!m.userData || !m.userData.region) return false;
                const otherPos = m.getPosition();
                const otherPixel = amapMap.lngLatToContainer(otherPos);
                const distance = Math.sqrt(
                    Math.pow(otherPixel.x - pixel.x, 2) + 
                    Math.pow(otherPixel.y - pixel.y, 2)
                );
                return distance < 30; // 30 pixels threshold
            });

            if (nearbyMarkers.length > 0) {
                // Multiple markers nearby, show popup
                const regions = [region, ...nearbyMarkers.map(m => m.userData.region)];
                // Get container coordinates relative to viewport
                const container = amapMap.getContainer();
                const rect = container.getBoundingClientRect();
                showOverlappingMarkersPopup(regions, rect.left + pixel.x, rect.top + pixel.y);
            } else {
                // Single marker, show info directly
                showRegionInfo(region);
            }
        });

        // Add to map
        marker.setMap(amapMap);
        amapMarkers.push(marker);
        markersAdded++;
    });

    console.log(`Map: Added ${markersAdded} markers, skipped ${markersSkipped} (missing/invalid coordinates)`);
}

// Create popup content for map markers
function createPopupContent(region) {
    return `
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 0.5rem 0; color: #667eea;">${region.region}</h3>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>云厂商:</strong> ${region.cloud_provider}</p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>可用区:</strong> ${region.availability_zones}</p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>开服日期:</strong> ${region.launch_date}</p>
        </div>
    `;
}

// Update Table view
function updateTable() {
    const tbody = document.getElementById('regions-table-body');
    tbody.innerHTML = '';

    if (filteredRegions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">没有找到匹配的地域</td></tr>';
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

        const channelsHtml = region.channels.map(ch => 
            `<span class="channel-tag">${ch}</span>`
        ).join('');

        row.innerHTML = `
            <td>${region.cloud_provider}</td>
            <td>${region.region}</td>
            <td>${region.region_code || '-'}</td>
            <td>${region.availability_zones}</td>
            <td>${region.launch_date}</td>
            <td><div class="channels">${channelsHtml}</div></td>
        `;

        tbody.appendChild(row);
    });
}

// Reset sidebar to empty state
function resetSidebar() {
    const content = document.getElementById('region-info-content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <p>点击地图上的标记点查看地域详细信息</p>
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
    globeMarkers.forEach(markerGroup => {
        if (markerGroup.userData && markerGroup.userData.markerMesh) {
            markerGroup.userData.isSelected = false;
            markerGroup.userData.markerMesh.material.emissiveIntensity = 0.5;
            // Scale will be updated in animate loop based on camera distance
        }
    });

    // Reset Map markers
    amapMarkers.forEach(marker => {
        const content = marker.getContent();
        if (content) {
            content.style.transform = 'scale(1)';
            content.style.borderWidth = '3px';
            content.style.zIndex = 'auto';
        }
    });
}

// Show region info in sidebar
function showRegionInfo(region) {
    // Don't show sidebar in table view
    if (currentViewMode === 'table') {
        return;
    }

    selectedRegion = region;
    const content = document.getElementById('region-info-content');

    // Get cloud provider color
    const providerConfig = getCloudProviderConfig(region.cloud_provider);
    const providerColorHex = '#' + providerConfig.color.toString(16).padStart(6, '0');

    const channelsHtml = region.channels.map(ch => 
        `<span class="channel-tag">${ch}</span>`
    ).join('');

    content.innerHTML = `
        <h3 style="color: ${providerColorHex};">${region.region}</h3>
        <div class="info-item">
            <label>云厂商</label>
            <div class="value">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${providerColorHex}; border-radius: 50%; margin-right: 0.5rem; vertical-align: middle;"></span>
                ${region.cloud_provider}
            </div>
        </div>
        <div class="info-item">
            <label>地域代码</label>
            <div class="value">${region.region_code || '-'}</div>
        </div>
        <div class="info-item">
            <label>可用区数量</label>
            <div class="value">${region.availability_zones}</div>
        </div>
        <div class="info-item">
            <label>开服日期</label>
            <div class="value">${region.launch_date}</div>
        </div>
        <div class="info-item">
            <label>支持的渠道</label>
            <div class="value">
                <div class="channels">${channelsHtml}</div>
            </div>
        </div>
        ${region.latitude && region.longitude ? `
        <div class="info-item">
            <label>坐标</label>
            <div class="value">${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}</div>
        </div>
        ` : ''}
    `;

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
    globeMarkers.forEach(markerGroup => {
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
                // Scale will be updated in animate loop based on camera distance
            }
        }
    });

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
    regions.forEach(region => {
        const providerConfig = getCloudProviderConfig(region.cloud_provider);
        const providerColorHex = '#' + providerConfig.color.toString(16).padStart(6, '0');

        const item = document.createElement('div');
        item.className = 'overlapping-marker-item';
        item.innerHTML = `
            <span class="overlapping-marker-color" style="background: ${providerColorHex};"></span>
            <div class="overlapping-marker-info">
                <div class="overlapping-marker-name">${region.region}</div>
                <div class="overlapping-marker-provider">${region.cloud_provider}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            showRegionInfo(region);
            hideOverlappingMarkersPopup();
        });
        list.appendChild(item);
    });

    // Position popup near click position
    popup.style.left = `${x + 10}px`;
    popup.style.top = `${y + 10}px`;

    // Adjust if popup goes off screen
    const rect = popup.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        popup.style.left = `${x - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
        popup.style.top = `${y - rect.height - 10}px`;
    }

    popup.classList.remove('hidden');
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

// Check for overlapping markers in Globe view
function checkGlobeMarkerOverlaps(mouseX, mouseY) {
    // Don't hide popup if mouse is over it
    if (isMouseOverPopup(mouseX, mouseY)) {
        return false;
    }

    const mouse = new THREE.Vector2();
    const rect = globeRenderer.domElement.getBoundingClientRect();
    mouse.x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((mouseY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, globeCamera);

    const allMarkerObjects = [];
    globeMarkers.forEach(markerGroup => {
        allMarkerObjects.push(markerGroup);
        markerGroup.children.forEach(child => allMarkerObjects.push(child));
    });

    const intersects = raycaster.intersectObjects(allMarkerObjects, true);
    if (intersects.length > 0) {
        // Collect unique marker groups (not individual objects)
        const uniqueMarkerGroups = new Set();
        const clickedRegions = [];
        
        intersects.forEach(intersect => {
            let obj = intersect.object;
            // Find the markerGroup (top-level parent with region data)
            while (obj) {
                // Check if this is a markerGroup (has region data and is in globeMarkers)
                if (obj.userData && obj.userData.region) {
                    // Check if this is actually a markerGroup, not just a child
                    const isMarkerGroup = globeMarkers.includes(obj);
                    if (isMarkerGroup) {
                        // This is a unique markerGroup
                        if (!uniqueMarkerGroups.has(obj)) {
                            uniqueMarkerGroups.add(obj);
                            const region = obj.userData.region;
                            // Check if region already added
                            if (!clickedRegions.find(r => r.region === region.region && r.cloud_provider === region.cloud_provider)) {
                                clickedRegions.push(region);
                            }
                        }
                        break;
                    } else {
                        // This is a child, find the parent markerGroup
                        let parent = obj.parent;
                        while (parent) {
                            if (globeMarkers.includes(parent)) {
                                if (!uniqueMarkerGroups.has(parent)) {
                                    uniqueMarkerGroups.add(parent);
                                    const region = parent.userData.region;
                                    if (!clickedRegions.find(r => r.region === region.region && r.cloud_provider === region.cloud_provider)) {
                                        clickedRegions.push(region);
                                    }
                                }
                                break;
                            }
                            parent = parent.parent;
                        }
                        break;
                    }
                }
                obj = obj.parent;
            }
        });

        if (clickedRegions.length > 1) {
            // Multiple unique markers, show popup
            showOverlappingMarkersPopup(clickedRegions, mouseX, mouseY);
            return true;
        } else {
            // Only hide if mouse is not over popup
            if (!isMouseOverPopup(mouseX, mouseY)) {
                hideOverlappingMarkersPopup();
            }
        }
    } else {
        // Only hide if mouse is not over popup
        if (!isMouseOverPopup(mouseX, mouseY)) {
            hideOverlappingMarkersPopup();
        }
    }
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

