import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, RefreshCw, Check, Loader2, AlertTriangle, Download, Printer, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFaceLandmarker } from '../../hooks/useFaceLandmarker';
import { ImageProcessor } from '../../utils/processor';

export default function CaptureFlow() {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const { landmarker, isLoading: isModelLoading, error } = useFaceLandmarker();

    // State
    const [status, setStatus] = useState("Loading AI...");
    const [faceDetected, setFaceDetected] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [printSheet, setPrintSheet] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Refs
    const lastVideoTime = useRef(-1);
    const animationRef = useRef(null);
    const landmarksRef = useRef(null);

    // Simple Face Detection Loop (no strict validation)
    const predictWebcam = useCallback(() => {
        if (!landmarker || !webcamRef.current?.video) return;

        const video = webcamRef.current.video;
        if (video.currentTime !== lastVideoTime.current && video.readyState >= 2) {
            lastVideoTime.current = video.currentTime;
            const startTimeMs = performance.now();

            try {
                const results = landmarker.detectForVideo(video, startTimeMs);

                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    landmarksRef.current = results.faceLandmarks[0];
                    setFaceDetected(true);
                    setStatus("Face Detected - Ready!");
                } else {
                    setFaceDetected(false);
                    setStatus("Position your face in view");
                }
            } catch (err) {
                console.error("Detection error:", err);
            }
        }
        animationRef.current = requestAnimationFrame(predictWebcam);
    }, [landmarker]);

    useEffect(() => {
        if (landmarker && !capturedImage) {
            predictWebcam();
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, [landmarker, predictWebcam, capturedImage]);

    // Capture & Auto-Process
    const handleCapture = async () => {
        if (!faceDetected || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        setIsProcessing(true);
        setStatus("Processing...");

        try {
            // AI Auto-Process: Background removal + Smart crop to ICA specs
            const finalUrl = await ImageProcessor.process(imageSrc, landmarksRef.current);
            setProcessedImage(finalUrl);

            // Generate print sheet
            const sheet = await ImageProcessor.generatePrintSheet(finalUrl);
            setPrintSheet(sheet);

            setStatus("Done!");
        } catch (err) {
            console.error("Processing error:", err);
            setStatus("Processing Failed - Try Again");
            setCapturedImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setProcessedImage(null);
        setPrintSheet(null);
        setFaceDetected(false);
        setStatus("Position your face in view");
    };

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl text-white font-bold mb-2">AI Model Error</h2>
                <p className="text-slate-400 text-center max-w-sm mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Result State
    if (processedImage) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-white mb-2">ICA Compliant Photo</h2>
                <p className="text-slate-400 mb-6">400×514px • 75% Face Coverage • White Background</p>

                <div className="bg-white p-4 rounded-xl shadow-2xl mb-8">
                    <img
                        src={processedImage}
                        alt="Visa Photo"
                        className="w-[200px] h-[257px] object-cover"
                    />
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-8">
                    <a
                        href={processedImage}
                        download="singapore_visa_photo.jpg"
                        className="px-6 py-3 rounded-full bg-teal-500 text-slate-900 font-bold flex items-center gap-2 hover:bg-teal-400 transition-colors"
                    >
                        <Download className="w-5 h-5" /> Digital Photo
                    </a>
                    {printSheet && (
                        <a
                            href={printSheet}
                            download="singapore_visa_print_sheet.jpg"
                            className="px-6 py-3 rounded-full bg-blue-500 text-white font-bold flex items-center gap-2 hover:bg-blue-400 transition-colors"
                        >
                            <Printer className="w-5 h-5" /> Print Sheet (4×6)
                        </a>
                    )}
                </div>

                <button
                    onClick={handleRetake}
                    className="px-6 py-3 rounded-full bg-slate-800 text-white font-medium flex items-center gap-2 hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw className="w-5 h-5" /> Take New Photo
                </button>
            </div>
        );
    }

    // Camera State - SIMPLIFIED
    return (
        <div className="min-h-screen bg-black flex flex-col relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full bg-slate-800/70 text-white backdrop-blur-md"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all ${faceDetected
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                    {isModelLoading ? "Loading AI..." : status}
                </div>

                <div className="w-10" />
            </div>

            {/* Camera Feed - Full view, no restrictive overlay */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-900">
                {!capturedImage && (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={0.95}
                        videoConstraints={{
                            facingMode: "user"
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                        mirrored={true}
                    />
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
                        <Loader2 className="w-16 h-16 text-teal-400 animate-spin mb-4" />
                        <p className="text-white text-xl font-medium">Auto-Processing...</p>
                        <p className="text-slate-400 text-sm mt-2">Removing background & cropping to ICA specs</p>
                    </div>
                )}

                {/* Simple Guide - Just a subtle indicator */}
                {!capturedImage && !isProcessing && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        {/* Very subtle oval guide - just for reference */}
                        <div className={`w-[60%] max-w-[400px] aspect-[35/45] border-2 border-dashed rounded-[50%] transition-all duration-300 ${faceDetected
                                ? 'border-green-400/50'
                                : 'border-white/20'
                            }`} />
                    </div>
                )}

                {/* Tip at bottom of camera view */}
                {!capturedImage && !isProcessing && (
                    <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                        <p className="text-white/60 text-sm">
                            Just look at the camera naturally • We'll auto-crop it perfectly
                        </p>
                    </div>
                )}
            </div>

            {/* Capture Button */}
            {!capturedImage && (
                <div className="p-6 pb-10 bg-black flex flex-col items-center gap-3">
                    <button
                        onClick={handleCapture}
                        disabled={!faceDetected || isModelLoading}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${faceDetected
                                ? 'border-green-500 bg-green-500/20 cursor-pointer hover:scale-105 active:scale-95'
                                : 'border-slate-700 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${faceDetected ? 'bg-white' : 'bg-slate-600'
                            }`}>
                            <Camera className={`w-8 h-8 ${faceDetected ? 'text-slate-900' : 'text-slate-400'}`} />
                        </div>
                    </button>
                    <p className="text-slate-500 text-sm">
                        {faceDetected
                            ? "Tap to capture"
                            : "Looking for your face..."}
                    </p>
                </div>
            )}
        </div>
    );
}
