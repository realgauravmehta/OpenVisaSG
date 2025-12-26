import { useEffect, useState } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export function useFaceLandmarker() {
    const [landmarker, setLandmarker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
                );

                const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                setLandmarker(faceLandmarker);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load MediaPipe:", err);
                setError(err.message || "Failed to load AI Model");
                setIsLoading(false);
            }
        };

        if (!landmarker) {
            init();
        }
    }, [landmarker]);

    return { landmarker, isLoading, error };
}
