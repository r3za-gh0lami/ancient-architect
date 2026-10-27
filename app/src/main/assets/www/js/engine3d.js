/**
 * Ancient Architect (معمار کهن) - 3D Rendering Engine (Three.js)
 * High-Detail Procedural Generation of Persepolis
 */

window.Engine3D = {
    isInitialized: false,
    scene: null,
    camera: null,
    renderer: null,
    animationId: null,
    container: null,

    // Architectural Elements
    elements: [],
    targetProgress: 0,
    currentProgress: 0,

    init: function(domElement) {
        if (this.isInitialized) return;
        this.container = domElement;
        this.container.innerHTML = ''; // Clear SVG

        // 1. Setup Scene
        this.scene = new THREE.Scene();
        // Dark Lapis Night background (matching app theme)
        this.scene.background = new THREE.Color(0x060911);
        this.scene.fog = new THREE.FogExp2(0x060911, 0.04);

        // 2. Setup Camera (Isometric / Cinematic Angle)
        const width = this.container.clientWidth || 256;
        const height = this.container.clientHeight || 256;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(12, 10, 15);
        this.camera.lookAt(0, 2, 0);

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. Lighting (Dramatic Cinematic Lighting)
        const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2); // Blueish night light
        this.scene.add(ambientLight);

        const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
        moonLight.position.set(-10, 20, -10);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 1024;
        moonLight.shadow.mapSize.height = 1024;
        this.scene.add(moonLight);

        // Golden Torch Lights
        const torch1 = new THREE.PointLight(0xf59e0b, 2.5, 15);
        torch1.position.set(5, 1, 5);
        torch1.castShadow = true;
        this.scene.add(torch1);

        const torch2 = new THREE.PointLight(0xd97706, 2.0, 15);
        torch2.position.set(-5, 1, -5);
        torch2.castShadow = true;
        this.scene.add(torch2);

        // 5. Materials
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.9,
            metalness: 0.1
        });

        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            roughness: 0.3,
            metalness: 0.8
        });

        const darkStoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 1.0,
            metalness: 0.0
        });

        // 6. Build the Architecture (Procedural Persepolis)
        const structGroup = new THREE.Group();
        this.elements = []; // Store elements for construction animation

        // Base Platform (Tiered)
        const base1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 14), darkStoneMaterial);
        base1.position.y = -0.25;
        base1.receiveShadow = true;
        structGroup.add(base1);

        const base2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 12), stoneMaterial);
        base2.position.y = 0.25;
        base2.receiveShadow = true;
        base2.castShadow = true;
        structGroup.add(base2);

        // Add elements to animation array based on height (bottom to top construction)
        this.elements.push({ mesh: base1, targetScaleY: 1, buildOrder: 0 });
        this.elements.push({ mesh: base2, targetScaleY: 1, buildOrder: 5 });

        // Columns (Apadana Style)
        const columnPositions = [
            [-3, -3], [3, -3], [-3, 3], [3, 3]
        ];

        columnPositions.forEach((pos, index) => {
            const x = pos[0];
            const z = pos[1];

            // Base of column
            const cBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 16), stoneMaterial);
            cBase.position.set(x, 0.75, z);
            cBase.castShadow = true;
            cBase.receiveShadow = true;
            structGroup.add(cBase);
            this.elements.push({ mesh: cBase, targetScaleY: 1, buildOrder: 10 + index });

            // Shaft
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 6, 16), stoneMaterial);
            shaft.position.set(x, 4.0, z);
            shaft.castShadow = true;
            shaft.receiveShadow = true;
            structGroup.add(shaft);
            this.elements.push({ mesh: shaft, targetScaleY: 1, buildOrder: 20 + index * 5 });

            // Capital (Golden Bull/Detail)
            const capital = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.2), goldMaterial);
            capital.position.set(x, 7.5, z);
            capital.castShadow = true;
            structGroup.add(capital);
            this.elements.push({ mesh: capital, targetScaleY: 1, buildOrder: 60 + index * 5 });
        });

        // Roof Beams
        const beam1 = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 1.0), stoneMaterial);
        beam1.position.set(0, 8.2, -3);
        beam1.castShadow = true;
        structGroup.add(beam1);
        this.elements.push({ mesh: beam1, targetScaleY: 1, buildOrder: 85 });

        const beam2 = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 1.0), stoneMaterial);
        beam2.position.set(0, 8.2, 3);
        beam2.castShadow = true;
        structGroup.add(beam2);
        this.elements.push({ mesh: beam2, targetScaleY: 1, buildOrder: 90 });

        // Center piece
        const centerEmblem = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32), goldMaterial);
        centerEmblem.position.set(0, 0.6, 0);
        centerEmblem.rotation.x = Math.PI / 2;
        centerEmblem.castShadow = true;
        structGroup.add(centerEmblem);
        this.elements.push({ mesh: centerEmblem, targetScaleY: 1, buildOrder: 15 });

        this.scene.add(structGroup);

        // Initially hide all parts by setting scale to 0
        this.elements.forEach(el => {
            el.mesh.scale.set(0.001, 0.001, 0.001);
            el.mesh.visible = false;
        });

        this.isInitialized = true;
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => {
            if (!this.container) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    },

    updateProgress: function(percent) {
        this.targetProgress = percent; // 0 to 100
    },

    animate: function() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        // Smoothly interpolate current progress towards target
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1; // Faster interpolation

        // Animate elements popping up based on progress
        this.elements.forEach(el => {
            // Build order is roughly equivalent to percentage needed to show it
            if (this.currentProgress >= el.buildOrder) {
                el.mesh.visible = true;
                // Pop up animation - Faster pop up
                el.mesh.scale.y += (el.targetScaleY - el.mesh.scale.y) * 0.2;
                el.mesh.scale.x += (1 - el.mesh.scale.x) * 0.2;
                el.mesh.scale.z += (1 - el.mesh.scale.z) * 0.2;
            } else {
                // Collapse if progress goes down
                el.mesh.scale.y += (0.001 - el.mesh.scale.y) * 0.2;
                el.mesh.scale.x += (0.001 - el.mesh.scale.x) * 0.2;
                el.mesh.scale.z += (0.001 - el.mesh.scale.z) * 0.2;
                if (el.mesh.scale.y < 0.01) el.mesh.visible = false;
            }
        });

        // Slowly rotate the entire scene for a cinematic view
        this.scene.rotation.y -= 0.002;

        // Torch flicker effect
        this.scene.children.forEach(child => {
            if (child.isPointLight) {
                child.intensity = child.userData.baseIntensity || child.intensity;
                if (!child.userData.baseIntensity) child.userData.baseIntensity = child.intensity;
                // Add random flicker
                child.intensity = child.userData.baseIntensity + (Math.random() * 0.3 - 0.15);
            }
        });

        this.renderer.render(this.scene, this.camera);
    },

    stop: function() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.renderer && this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
};