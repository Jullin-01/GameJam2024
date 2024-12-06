import * as THREE from 'three';

export class Viewport {
    constructor() {
        console.log('Viewport constructor');
        this._renderer = null;
        this._Init();
        this._isCinematic = false;
        this._camera = null;
    }

    _Init() {
        this._canvas = document.getElementById('canvas');

        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas });
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        this._renderer.antialias = true;
        this._renderer.shadowMap.enabled = true;

        this._renderer.toneMapping = THREE.NeutralToneMapping;
            //THREE.NoToneMapping;
            //THREE.LinearToneMapping;
            //THREE.ReinhardToneMapping;
            //THREE.CineonToneMapping;
            //THREE.ACESFilmicToneMapping;
            //THREE.AgXToneMapping;
            //THREE.NeutralToneMapping;
            //THREE.CustomToneMapping;
        this._renderer.toneMappingExposure = 1.0;

        this._defaultRendererMarginTop = this._renderer.domElement.style.marginTop;
        this._defaultRendererMarginLeft = this._renderer.domElement.style.marginLeft;

        window.addEventListener('resize', () => this.Resize());
    }

    Resize() {
        if (this._isCinematic) {
            this._ResizeCinematic();
        }
        else {
            this._ResizeGame(this._camera);
        }
    }

    _ResizeGame(camera) {
        this._renderer.domElement.style.marginTop = this._defaultRendererMarginTop;
        this._renderer.domElement.style.marginLeft = this._defaultRendererMarginLeft;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this._canvas.width = width;
        this._canvas.height = height;

        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        this._renderer.setSize(this._canvas.width, this._canvas.height);
        this._renderer.setPixelRatio = this._canvas.width / this._canvas.height;
    }

    _ResizeCinematic() {
        const aspect = 16 / 9;
        const width = window.innerWidth;
        const height = window.innerHeight;
 
        const windowAspect = width / height;

        if (windowAspect > aspect) {
            // The screen is wider than necessary - add stripes on the sides
            const renderHeight = height;
            const renderWidth = renderHeight * aspect;
            this._renderer.setSize(renderWidth, renderHeight);

            // Center the canvas horizontally
            this._renderer.domElement.style.marginLeft = `${(width - renderWidth) / 2}px`;
            this._renderer.domElement.style.marginTop = `0px`;
        } else {
            // The screen is higher than necessary - add stripes at the top and bottom
            const renderWidth = width;
            const renderHeight = renderWidth / aspect;
            this._renderer.setSize(renderWidth, renderHeight);

            // Center the canvas vertically
            this._renderer.domElement.style.marginTop = `${(height - renderHeight) / 2}px`;
            this._renderer.domElement.style.marginLeft = `0px`;
        }
 
    }

    GetRenderer() {
        return this._renderer;
    }
};