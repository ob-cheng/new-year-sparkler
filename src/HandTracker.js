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
      // Strict Logic:
      // A. Thumb Tip (4) must be ABOVE Thumb IP (3) (y is smaller)
      // B. Thumb Tip must be ABOVE Index MCP (5) (Knuckle)
      // C. KEY: All other digits (8, 12, 16, 20) must be CURLED (below their PIP/MCP joints) 
      //    OR just simpler: Thumb Tip is the HIGHEST point of the hand (lowest Y).
      
      const thumbTip = landmarks[4];
      const thumbIP = landmarks[3];
      // indexTip already defined above
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      
      // Check 1: Thumb is pointing UP (Tip y < IP y)
      const isThumbRigid = thumbTip.y < thumbIP.y;
      
      // Check 2: Thumb is the HIGHEST finger (lowest Y value)
      // Allow small margin for error
      const margin = 0.05; 
      const isHighest = thumbTip.y < (indexTip.y - margin) && 
                        thumbTip.y < (middleTip.y - margin) &&
                        thumbTip.y < (ringTip.y - margin) &&
                        thumbTip.y < (pinkyTip.y - margin);

      const isThumbUp = isThumbRigid && isHighest;
      
      // 3. Detect "Open Hand" (All fingers extended)
      // Check if Index, Middle, Ring, Pinky tips are above their PIP joints
      // AND Thumb is relatively extended
      const isIndexOpen = landmarks[8].y < landmarks[6].y;
      const isMiddleOpen = landmarks[12].y < landmarks[10].y;
      const isRingOpen = landmarks[16].y < landmarks[14].y;
      const isPinkyOpen = landmarks[20].y < landmarks[18].y;
      const isThumbOpen = landmarks[4].x < landmarks[3].x; // Dependent on handedness, maybe skip thumb for openness or check distance
      
      // Simple openness: 4 fingers extended
      const isOpenHand = isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen;

      if (this.onLandmarks) {
        this.onLandmarks({
            x, y,
            isThumbUp,
            isOpenHand
        });
      }
    }
  }
}
