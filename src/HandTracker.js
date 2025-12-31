import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class HandTracker {
  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.style.display = 'none'; // Hidden, we render to canvas or just bg
    document.body.appendChild(this.videoElement);
    
    // We will render the video feed to a background canvas for AR feel
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.id = 'ar-background';
    this.bgCanvas.style.position = 'fixed';
    this.bgCanvas.style.top = '0';
    this.bgCanvas.style.left = '0';
    this.bgCanvas.style.width = '100%';
    this.bgCanvas.style.height = '100%';
    this.bgCanvas.style.zIndex = '-1'; // Behind everything
    this.bgCanvas.style.objectFit = 'cover';
    this.bgCanvas.style.display = 'none'; // Hidden by default
    document.body.appendChild(this.bgCanvas);
    
    this.ctx = this.bgCanvas.getContext('2d');
    
    this.onLandmarks = null; // Callback
    this.active = false;
    
    this.hands = new Hands({locateFile: (file) => {
      // Use CDN for assets
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    this.hands.onResults(this.onResults.bind(this));
    
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.active) {
          await this.hands.send({image: this.videoElement});
        }
      },
      width: 1280,
      height: 720
    });
  }
  
  start(callback) {
    this.active = true;
    this.onLandmarks = callback;
    this.bgCanvas.style.display = 'block';
    this.camera.start();
  }
  
  stop() {
    this.active = false;
    this.bgCanvas.style.display = 'none';
    // this.camera.stop(); // Camera API doesn't always stop cleanly, but flag handles it
  }
  
  onResults(results) {
    // Draw video feed to background
    const width = this.bgCanvas.width = window.innerWidth;
    const height = this.bgCanvas.height = window.innerHeight;
    
    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);
    
    // Mirror effect
    this.ctx.translate(width, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(results.image, 0, 0, width, height);
    this.ctx.restore();
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // 1. Get Index Finger Tip (Landmark 8) for Position
      // MediaPipe coords are 0-1. Mirroring means x is flipped already?
      // Wait, we drew mirrored. Logic needs to match visual.
      // If visual is mirrored, x=0.1 (left) is actually right side of image?
      // Let's rely on visual frame. 
      // MediaPipe gives x 0 (left) to 1 (right) relative to un-mirrored image.
      // If we mirror the drawing, we must mirror the coordinate: 1 - x
      
      const indexTip = landmarks[8];
      const x = (1 - indexTip.x) * width;
      const y = indexTip.y * height;
      
      // 2. Detect "Thumb Up"
      // Thumb Tip (4) should be significantly higher (lower y) than Thumb IP (3)
      // AND Index Finger is curled or at least not higher than thumb?
      // Simple heuristic: Thumb Tip y < Thumb IP y && Thumb Tip y < Index Tip y (maybe?)
      // Actually "Thumb Up" usually means fist closed except thumb.
      
      // Let's compare Thumb Tip (4) vs Index Tip (8), Middle (12), Ring (16), Pinky (20).
      // Good Thumb Up: Thumb Tip is highest point (lowest Y).
      const thumbTip = landmarks[4];
      const isThumbUp = thumbTip.y < landmarks[3].y // Thumb is extending up
                        && thumbTip.y < landmarks[8].y // Higher than index
                        && thumbTip.y < landmarks[12].y; // Higher than middle
      
      if (this.onLandmarks) {
        this.onLandmarks({
            x, y,
            isThumbUp
        });
      }
    }
  }
}
