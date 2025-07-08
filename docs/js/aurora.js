/**
 * Aurora Background Effect
 * Pure JavaScript implementation inspired by Aurora component
 */
class Aurora {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            colorStops: options.colorStops || ["#3A29FF", "#FF94B4", "#FF3232"],
            blend: options.blend || 0.5,
            amplitude: options.amplitude || 1.0,
            speed: options.speed || 0.5,
            opacity: options.opacity || 0.6
        };
        
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupCanvas();
        this.startAnimation();
        this.setupResize();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = this.options.opacity;
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }
    
    setupCanvas() {
        this.resize();
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupResize() {
        window.addEventListener('resize', () => this.resize());
    }
    
    // Simple noise function for wave generation
    noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n));
    }
    
    // Generate smooth wave using multiple octaves
    generateWave(x, time, amplitude) {
        let wave = 0;
        const frequency = 0.01;
        
        // Multiple octaves for more complex wave
        wave += Math.sin(x * frequency + time * 0.5) * amplitude * 0.5;
        wave += Math.sin(x * frequency * 2 + time * 0.3) * amplitude * 0.3;
        wave += Math.sin(x * frequency * 4 + time * 0.7) * amplitude * 0.2;
        
        return wave;
    }
    
    // Convert hex color to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Interpolate between colors
    interpolateColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * factor),
            g: Math.round(color1.g + (color2.g - color1.g) * factor),
            b: Math.round(color1.b + (color2.b - color1.b) * factor)
        };
    }
    
    // Get color from gradient based on position
    getGradientColor(position) {
        const colors = this.options.colorStops.map(hex => this.hexToRgb(hex));
        const segments = colors.length - 1;
        const segmentPosition = position * segments;
        const segmentIndex = Math.floor(segmentPosition);
        const localPosition = segmentPosition - segmentIndex;
        
        if (segmentIndex >= segments) {
            return colors[colors.length - 1];
        }
        
        return this.interpolateColor(colors[segmentIndex], colors[segmentIndex + 1], localPosition);
    }
    
    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Create aurora waves
        const numWaves = 3;
        const waveHeight = height * 0.6;
        
        for (let waveIndex = 0; waveIndex < numWaves; waveIndex++) {
            const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
            
            // Create gradient across width
            for (let i = 0; i <= 10; i++) {
                const position = i / 10;
                const color = this.getGradientColor(position);
                gradient.addColorStop(position, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 - waveIndex * 0.1})`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            
            // Generate wave path
            const baseY = height * 0.3 + waveIndex * height * 0.1;
            const timeOffset = waveIndex * 0.5;
            
            this.ctx.moveTo(0, height);
            
            for (let x = 0; x <= width; x += 2) {
                const normalizedX = x / width;
                const wave = this.generateWave(normalizedX, this.time + timeOffset, this.options.amplitude);
                const y = baseY + wave * waveHeight * 0.2;
                
                if (x === 0) {
                    this.ctx.lineTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.lineTo(width, height);
            this.ctx.lineTo(0, height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Add some shimmering particles
        this.renderParticles();
    }
    
    renderParticles() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const numParticles = 20;
        
        for (let i = 0; i < numParticles; i++) {
            const x = (width * (i / numParticles) + this.time * 50) % width;
            const baseY = height * 0.3;
            const y = baseY + Math.sin(x * 0.01 + this.time) * height * 0.2;
            
            const color = this.getGradientColor(x / width);
            const alpha = (Math.sin(this.time + i) + 1) * 0.25;
            
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    animate() {
        this.time += this.options.speed * 0.016; // Roughly 60fps timing
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        this.animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resize);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
    
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        if (this.canvas) {
            this.canvas.style.opacity = this.options.opacity;
        }
    }
}

// Make available globally
window.Aurora = Aurora;