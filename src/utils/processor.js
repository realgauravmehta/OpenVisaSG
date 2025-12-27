import { removeBackground } from '@imgly/background-removal';

/**
 * ICA Photo Processor
 * Handles background removal and smart cropping to ICA specifications
 * 
 * Output: 400x514px JPEG with white background
 * Face coverage: 70-80% of photo height
 */

export class ImageProcessor {
    // ICA Digital Photo Dimensions (for online submission)
    static TARGET_WIDTH = 400;
    static TARGET_HEIGHT = 514;
    static TARGET_RATIO = 400 / 514;  // 0.778 (35:45mm)

    // HD Print Dimensions (35x45mm at 600 DPI for high quality prints)
    static HD_WIDTH = 827;   // 35mm at 600 DPI
    static HD_HEIGHT = 1063; // 45mm at 600 DPI

    // ICA Face Coverage: Should be ~70-80% of photo height
    // Using 65% to ensure 80% face + 20% shoulders visible
    static TARGET_FACE_RATIO = 0.65;

    // Eye position: ~40% from top (gives more room for hair and shoulders)
    static EYE_POSITION_RATIO = 0.40;

    /**
     * Main processing pipeline
     * 1. Remove background (WASM - local)
     * 2. Smart crop based on face landmarks
     * 3. Output 400x514 JPEG with white background
     */
    static async process(imageSrc, landmarks) {
        console.log("[Processor] Starting ICA photo processing...");

        // Step 1: Remove Background with quality settings for sharp edges
        console.log("[Processor] Removing background...");
        const blob = await removeBackground(imageSrc, {
            model: 'medium',  // Use medium model for better edge accuracy
            output: {
                format: 'image/png',  // PNG for lossless edges during processing
                quality: 1.0
            },
            progress: (key, current, total) => {
                console.log(`[Processor] ${key}: ${Math.round((current / total) * 100)}%`);
            }
        });

        // Convert to ImageBitmap for manipulation
        const bitmap = await createImageBitmap(blob);
        console.log(`[Processor] Background removed. Image: ${bitmap.width}x${bitmap.height}`);

        // Step 2: Create output canvas with crisp rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.TARGET_WIDTH;
        canvas.height = this.TARGET_HEIGHT;

        // Disable image smoothing for sharp pixel-perfect edges
        ctx.imageSmoothingEnabled = false;

        // Fill with pure white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, this.TARGET_WIDTH, this.TARGET_HEIGHT);

        // Re-enable smoothing for the actual image draw (prevents pixelation)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Step 3: Calculate safe crop region
        const cropBox = this.calculateSafeCrop(landmarks, bitmap.width, bitmap.height);
        console.log(`[Processor] Crop: x=${cropBox.x.toFixed(0)}, y=${cropBox.y.toFixed(0)}, w=${cropBox.w.toFixed(0)}, h=${cropBox.h.toFixed(0)}`);

        // Step 4: Draw cropped image onto canvas
        ctx.drawImage(
            bitmap,
            cropBox.x, cropBox.y, cropBox.w, cropBox.h,  // Source
            0, 0, this.TARGET_WIDTH, this.TARGET_HEIGHT   // Destination
        );

        // Step 5: Export as JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log("[Processor] Photo ready!");

        return dataUrl;
    }

    /**
     * Calculate SAFE ICA-compliant crop region
     * 
     * Key improvements:
     * - Uses FULL face bounding box (forehead to chin)
     * - Adds padding for hair/shoulders
     * - Never crops outside image bounds
     * - Scales to fit if face is too small
     */
    static calculateSafeCrop(landmarks, imgW, imgH) {
        // Key landmarks for face bounds
        const chin = landmarks[152];           // Bottom of chin
        const forehead = landmarks[10];        // Top of forehead
        const leftCheek = landmarks[234];      // Left side of face
        const rightCheek = landmarks[454];     // Right side of face
        const noseTip = landmarks[1];          // Center reference
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        // Fallback if landmarks missing
        if (!chin || !forehead || !noseTip) {
            console.warn("[Processor] Missing landmarks, using center crop");
            return this.centerCrop(imgW, imgH);
        }

        // Calculate face bounding box in pixels
        const faceTop = forehead.y * imgH;
        const faceBottom = chin.y * imgH;
        const faceLeft = (leftCheek?.x || noseTip.x - 0.1) * imgW;
        const faceRight = (rightCheek?.x || noseTip.x + 0.1) * imgW;

        const faceHeight = Math.abs(faceBottom - faceTop);
        const faceWidth = Math.abs(faceRight - faceLeft);

        // Use nose tip as the primary center reference (most reliable)
        const faceCenterX = noseTip.x * imgW;
        const eyeCenterY = ((leftEye?.y || forehead.y) + (rightEye?.y || forehead.y)) / 2 * imgH;

        console.log(`[Processor] Face: ${faceWidth.toFixed(0)}x${faceHeight.toFixed(0)}px, center X: ${faceCenterX.toFixed(0)}, eye Y: ${eyeCenterY.toFixed(0)}`);

        // ICA: Face should be ~70% of final photo height
        // targetPhotoHeight = faceHeight / 0.70
        let targetPhotoH = faceHeight / this.TARGET_FACE_RATIO;
        let targetPhotoW = targetPhotoH * this.TARGET_RATIO;

        // SAFETY: Ensure crop box fits within image
        // If face is too small (far from camera), scale down to fit
        if (targetPhotoW > imgW) {
            console.log("[Processor] Crop wider than image, scaling to fit width");
            targetPhotoW = imgW;
            targetPhotoH = targetPhotoW / this.TARGET_RATIO;
        }
        if (targetPhotoH > imgH) {
            console.log("[Processor] Crop taller than image, scaling to fit height");
            targetPhotoH = imgH;
            targetPhotoW = targetPhotoH * this.TARGET_RATIO;
        }

        // Position: Eyes at 47% from top of final photo
        // cropY = eyeY - (photoHeight * 0.47)
        let cropY = eyeCenterY - (targetPhotoH * this.EYE_POSITION_RATIO);

        // Horizontal: Center on nose (face center)
        // This ensures the face is horizontally centered in the output
        let cropX = faceCenterX - (targetPhotoW / 2);

        // BOUNDARY CLAMPING: Ensure crop stays within image
        // Left bound
        if (cropX < 0) {
            console.log("[Processor] Clamping left boundary");
            cropX = 0;
        }
        // Right bound
        if (cropX + targetPhotoW > imgW) {
            console.log("[Processor] Clamping right boundary");
            cropX = imgW - targetPhotoW;
        }
        // Top bound (add padding for hair)
        if (cropY < 0) {
            console.log("[Processor] Clamping top boundary");
            cropY = 0;
        }
        // Bottom bound (add padding for shoulders)
        if (cropY + targetPhotoH > imgH) {
            console.log("[Processor] Clamping bottom boundary");
            cropY = imgH - targetPhotoH;
        }

        // Final safety: Ensure dimensions are positive
        const finalW = Math.max(10, Math.min(targetPhotoW, imgW - cropX));
        const finalH = Math.max(10, Math.min(targetPhotoH, imgH - cropY));

        return {
            x: Math.max(0, cropX),
            y: Math.max(0, cropY),
            w: finalW,
            h: finalH
        };
    }

    /**
     * Fallback center crop maintaining ICA aspect ratio
     */
    static centerCrop(imgW, imgH) {
        const targetRatio = this.TARGET_RATIO;
        const imgRatio = imgW / imgH;

        let cropW, cropH;

        if (imgRatio > targetRatio) {
            // Image is wider - crop sides
            cropH = imgH;
            cropW = imgH * targetRatio;
        } else {
            // Image is taller - crop top/bottom
            cropW = imgW;
            cropH = imgW / targetRatio;
        }

        return {
            x: (imgW - cropW) / 2,
            y: (imgH - cropH) / 2,
            w: cropW,
            h: cropH
        };
    }

    /**
     * Generate 4x6 inch print sheet with 4 photos
     * For physical printing at 300 DPI
     */
    static async generatePrintSheet(photoDataUrl) {
        // 4x6 inches at 300 DPI = 1200x1800 pixels
        const SHEET_W = 1200;
        const SHEET_H = 1800;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = SHEET_W;
        canvas.height = SHEET_H;

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, SHEET_W, SHEET_H);

        // Load the photo
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = photoDataUrl;
        });

        // 35x45mm at 300 DPI = ~413x531 pixels
        const PHOTO_W = 413;
        const PHOTO_H = 531;

        // Calculate positions for 4 photos (2x2 grid with margins)
        const marginX = (SHEET_W - 2 * PHOTO_W) / 3;
        const marginY = (SHEET_H - 2 * PHOTO_H) / 3;

        const positions = [
            { x: marginX, y: marginY },
            { x: marginX * 2 + PHOTO_W, y: marginY },
            { x: marginX, y: marginY * 2 + PHOTO_H },
            { x: marginX * 2 + PHOTO_W, y: marginY * 2 + PHOTO_H }
        ];

        // Draw 4 copies
        for (const pos of positions) {
            ctx.drawImage(img, pos.x, pos.y, PHOTO_W, PHOTO_H);
        }

        return canvas.toDataURL('image/jpeg', 0.95);
    }
}
