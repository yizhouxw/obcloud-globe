// Base Globe Class containing common logic
class BaseGlobe {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container ${containerId} not found`);

        this.config = config;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globeMesh = null;
        this.markerGroup = new THREE.Group(); // Group to hold all markers
        
        this.markers = []; // Array of marker objects
        this.animationId = null;
        this.autoRotate = true;
        this.lastAutoRotateTime = Date.now();
        
        // Interaction state
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.mouseDownPosition = { x: 0, y: 0 };
        this.hoverTimeout = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
    }

    async init() {
        this.setupScene();
        this.setupLights();
        this.setupInteraction();
        
        // Add marker group to scene (or to globe, depending on implementation)
        // By default adding to scene, but specific implementations might add to globeMesh
        this.scene.add(this.markerGroup);

        await this.loadAssets();
        
        this.startAnimation();
        window.addEventListener('resize', this.handleResize);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27);

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 300;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.container.innerHTML = ''; // Clear container
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Default lights, can be overridden
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    setupInteraction() {
        const dom = this.renderer.domElement;
        dom.addEventListener('mousedown', this.onMouseDown);
        dom.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp); // Listen on window for drag release outside
        dom.addEventListener('wheel', this.onWheel);
    }

    destroy() {
        this.stopAnimation();
        window.removeEventListener('resize', this.handleResize);
        
        const dom = this.renderer.domElement;
        dom.removeEventListener('mousedown', this.onMouseDown);
        dom.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        dom.removeEventListener('wheel', this.onWheel);
        
        if (this.container.contains(dom)) {
            this.container.removeChild(dom);
        }
        
        // Cleanup Three.js resources
        if (this.renderer) this.renderer.dispose();
        // Geometries and materials should also be disposed ideally
    }

    // Abstract methods to be implemented by subclasses
    async loadAssets() {}
    createMarker(region) {} 

    addMarkers(regions) {
        // Clear existing markers
        this.clearMarkers();
        
        let addedCount = 0;
        regions.forEach(region => {
            const markerObject = this.createMarker(region);
            if (markerObject) {
                this.markerGroup.add(markerObject);
                this.markers.push(markerObject);
                addedCount++;
            }
        });
        
        console.log(`[Globe] Added ${addedCount} markers`);
    }

    clearMarkers() {
        // Remove from scene/group
        while(this.markerGroup.children.length > 0){ 
            this.markerGroup.remove(this.markerGroup.children[0]); 
        }
        this.markers = [];
    }

    // Coordinate conversion
    latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate);
        
        // Auto rotation
        if (this.autoRotate && this.globeMesh) {
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastAutoRotateTime) / 1000;
            this.lastAutoRotateTime = currentTime;
            
            // 360 degrees in 60 seconds for smoother/slower rotation
            const rotationSpeed = (2 * Math.PI) / 60; 
            this.globeMesh.rotation.y += rotationSpeed * deltaTime;
            
            // If markers are not children of globeMesh, we need to rotate them too
            // But in this implementation, we will try to make markers children of globeMesh or a group that rotates
        } else {
            this.lastAutoRotateTime = Date.now();
        }
        
        // Specific update logic
        this.onUpdate();

        this.renderer.render(this.scene, this.camera);
    }

    onUpdate() {
        // Override for custom update logic (e.g. marker scaling)
    }

    handleResize() {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    // Interaction Handlers
    onMouseDown(e) {
        this.isDragging = true;
        this.mouseDownPosition = { x: e.clientX, y: e.clientY };
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        this.autoRotate = false;
    }

    onMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;
            
            if (this.globeMesh) {
                this.globeMesh.rotation.y += deltaX * 0.005;
                this.globeMesh.rotation.x += deltaY * 0.005;
            } else if (this.earthGroup) {
                this.earthGroup.rotation.y += deltaX * 0.005;
                this.earthGroup.rotation.x += deltaY * 0.005;
            }
            
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        } else {
             // Hover check logic can go here
             if (this.config.onHover) {
                 // Implement hover detection
             }
        }
    }

    onMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        // Check for click vs drag
        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - this.mouseDownPosition.x, 2) + 
            Math.pow(e.clientY - this.mouseDownPosition.y, 2)
        );

        if (dragDistance < 5) {
            this.handleRaycast(e.clientX, e.clientY);
        }
    }

    onWheel(e) {
        e.preventDefault();
        this.autoRotate = false;
        this.camera.position.z += e.deltaY * 0.5;
        this.camera.position.z = Math.max(150, Math.min(500, this.camera.position.z));
    }

    handleRaycast(clientX, clientY) {
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Intersect with markers
        // We need to find all objects that are part of markers
        const intersects = raycaster.intersectObjects(this.markers, true); // true for recursive
        
        if (intersects.length > 0) {
            if (this.config.onClick) {
                this.config.onClick(intersects, clientX, clientY);
            }
        }
    }
}

// 1. Classic Three.js Globe (The existing one)
class ClassicGlobe extends BaseGlobe {
    async loadAssets() {
        return new Promise((resolve) => {
            const geometry = new THREE.SphereGeometry(100, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                shininess: 30,
                specular: new THREE.Color(0x222222)
            });

            const textureLoader = new THREE.TextureLoader();
            // Try loading local texture first
            textureLoader.load(
                'assets/earth_atmos_2048.jpg',
                (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                    resolve();
                },
                undefined,
                (err) => {
                    console.warn('Failed to load local texture, trying fallback...');
                    textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', (tex) => {
                        material.map = tex;
                        resolve();
                    });
                }
            );

            this.globeMesh = new THREE.Mesh(geometry, material);
            
            // Add globeMesh to earthGroup (so we rotate earthGroup)
            // Wait, in base class we have globeMesh property. 
            // Let's add globeMesh to scene directly or to earthGroup?
            // In animate(), we rotate globeMesh.
            this.scene.add(this.globeMesh);
            
            // In Classic mode, markers rotate WITH the globe.
            // So markers should be added to globeMesh.
            // Override markerGroup behavior:
            this.globeMesh.add(this.markerGroup);
        });
    }

    createMarker(region) {
        if (!region.latitude || !region.longitude) return null;

        const phi = (90 - region.latitude) * (Math.PI / 180);
        const theta = (region.longitude + 180) * (Math.PI / 180);
        const radius = 100;
        const markerRadius = 100.5;

        const x = -(markerRadius * Math.sin(phi) * Math.cos(theta));
        const y = markerRadius * Math.cos(phi);
        const z = markerRadius * Math.sin(phi) * Math.sin(theta);

        // Get color
        const config = getCloudProviderConfig(region.cloud_provider); // Assumes global function from app.js
        const color = config.color;

        const group = new THREE.Group();
        group.userData = { region: region };
        group.position.set(x, y, z);

        const geometry = new THREE.SphereGeometry(2.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color * 0.7,
            emissiveIntensity: 0.3,
            shininess: 50
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        group.userData.markerMesh = mesh; // Ref for highlighting

        // Make marker look at center so it stands perpendicular to surface
        group.lookAt(0, 0, 0);

        return group;
    }

    onUpdate() {
        // Scale markers based on distance
        const cameraDistance = this.camera.position.z;
        const baseDistance = 300;
        const scaleFactor = cameraDistance / baseDistance;

        this.markers.forEach(group => {
            if (group.userData && group.userData.markerMesh) {
                const baseScale = group.userData.isSelected ? 1.3 : 1.0;
                group.userData.markerMesh.scale.setScalar(baseScale * scaleFactor);
            }
        });
    }
}

// Helper to create glow texture
const glowTextureCache = {};
function getGlowTexture() {
    if (glowTextureCache['default']) {
        return glowTextureCache['default'];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Draw glow
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    glowTextureCache['default'] = texture;
    return texture;
}

// 2. GitHub-Style Globe
class GithubGlobe extends BaseGlobe {
    async loadAssets() {
        // Load Texture and GeoJSON
        const texturePromise = new Promise((resolve) => {
            new THREE.TextureLoader().load('assets/github-globe/earth-dark.jpg', resolve, undefined, (err) => {
                console.warn('Failed to load earth-dark.jpg', err);
                resolve(null); // Continue even if texture fails
            });
        });

        const geoJsonPromise = fetch('assets/github-globe/globe-data-min.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .catch(e => {
                console.error("Failed to load GeoJSON:", e);
                return null;
            });

        const [texture, geoJson] = await Promise.all([texturePromise, geoJsonPromise]);

        // 1. Create Base Sphere
        const geometry = new THREE.SphereGeometry(100, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x111111, // Very dark base
            map: texture || null,
            shininess: 10,
            specular: new THREE.Color(0x111111)
        });
        
        this.globeMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.globeMesh);

        // 2. Create Landmass Lines/Dots from GeoJSON
        if (geoJson && geoJson.features) {
            this.addGeoJsonFeatures(geoJson);
        }

        // Add markers group to globeMesh so they rotate together
        this.globeMesh.add(this.markerGroup);
    }

    addGeoJsonFeatures(geoJson) {
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x88ccff, // Brighter blue-cyan
            transparent: true,
            opacity: 0.8 
        });

        // Helper to process polygon rings
        const processRing = (ring) => {
            const points = [];
            ring.forEach(coord => {
                // coord is [lon, lat]
                const vec = this.latLngToVector3(coord[1], coord[0], 100.2); // Slightly above surface
                points.push(vec);
            });
            return points;
        };

        const group = new THREE.Group();

        geoJson.features.forEach(feature => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates.forEach(ring => {
                    const points = processRing(ring);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    group.add(line);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        const points = processRing(ring);
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(geometry, lineMaterial);
                        group.add(line);
                    });
                });
            }
        });

        this.globeMesh.add(group);
        
        // Add "atmosphere" glow
        this.addAtmosphere();
    }

    addAtmosphere() {
        const vertexShader = `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const fragmentShader = `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `;
        
        const atmosphereGeo = new THREE.SphereGeometry(100, 64, 64);
        const atmosphereMat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        atmosphere.scale.set(1.1, 1.1, 1.1);
        this.scene.add(atmosphere); // Add to scene, not globe, so it doesn't rotate? Or does it?
        // Actually atmosphere usually surrounds the globe. If it's static lighting, scene is better.
        // But if we want it to wrap the rotating earth...
        // Let's attach to scene for now to keep the glow orientation fixed relative to camera.
    }

    createMarker(region) {
        if (!region.latitude || !region.longitude) return null;

        const vec = this.latLngToVector3(region.latitude, region.longitude, 100.5);
        
        const config = getCloudProviderConfig(region.cloud_provider);
        const color = config.color;

        const group = new THREE.Group();
        group.userData = { region: region };
        group.position.copy(vec);

        // Use 2D Sprite for GitHub style
        const map = getGlowTexture();
        const material = new THREE.SpriteMaterial({ 
            map: map, 
            color: color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false // Don't write to depth buffer to avoid occlusion issues with itself, but check depth
        });
        
        const sprite = new THREE.Sprite(material);
        
        // Base size for sprite (will be scaled in onUpdate)
        // Set an initial scale
        sprite.scale.set(1, 1, 1);
        
        group.add(sprite);
        group.userData.markerMesh = sprite;
        
        // Add a small point at the center for precise location
        const pointGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const point = new THREE.Mesh(pointGeo, pointMat);
        group.add(point);

        return group;
    }

    onUpdate() {
        // Scale markers based on distance to keep fixed screen size
        const cameraDistance = this.camera.position.z;
        const baseDistance = 300;
        const scaleFactor = cameraDistance / baseDistance;
        
        // Target size in world units at base distance
        // User requested "half of now". Previous was diameter ~8 (radius 4).
        // So let's aim for visual size around 4-5 units diameter at base distance.
        const baseSize = 8; 

        this.markers.forEach(group => {
            if (group.userData && group.userData.markerMesh) {
                const sprite = group.userData.markerMesh;
                
                // Highlight scale
                const highlightScale = group.userData.isSelected ? 1.5 : 1.0;
                
                // Final scale = baseSize * distanceFactor * highlight
                const finalScale = baseSize * scaleFactor * highlightScale;
                
                sprite.scale.set(finalScale, finalScale, 1);
            }
        });
    }
}
