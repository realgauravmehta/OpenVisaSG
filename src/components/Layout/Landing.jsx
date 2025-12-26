import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Zap, FileCheck, Printer, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal-500/5 to-transparent rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-2xl"
            >
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <motion.div
                        className="p-4 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl shadow-2xl shadow-teal-500/20"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Camera className="w-14 h-14 text-white" />
                    </motion.div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-white to-blue-200">
                    OpenVisaSG
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-400 mb-4">
                    Professional Singapore Visa Photos
                </p>
                <p className="text-lg text-teal-400 font-semibold mb-10">
                    100% Free • 100% Private • Runs Locally
                </p>

                {/* CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/capture')}
                    className="group relative px-10 py-5 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-900 font-bold text-xl rounded-full shadow-[0_0_40px_rgba(45,212,191,0.3)] transition-all mb-16"
                >
                    <span className="flex items-center gap-3">
                        <Camera className="w-6 h-6" />
                        Start Camera
                    </span>
                </motion.button>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                    <FeatureCard
                        icon={<ShieldCheck className="w-6 h-6 text-green-400" />}
                        title="ICA Compliant"
                        desc="400×514px, 70-80% face coverage, white background. Meets all official requirements."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-yellow-400" />}
                        title="AI-Powered"
                        desc="Real-time face detection, auto background removal, smart cropping. All in your browser."
                    />
                    <FeatureCard
                        icon={<FileCheck className="w-6 h-6 text-blue-400" />}
                        title="Live Validation"
                        desc="Checks position, rotation, eyes open, mouth closed. Guided capture for perfect results."
                    />
                </div>

                {/* Bottom Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
                    <SmallFeature icon={<Printer />} text="Print Sheet" />
                    <SmallFeature icon={<ShieldCheck />} text="No Server" />
                    <SmallFeature icon={<Sparkles />} text="White BG" />
                    <SmallFeature icon={<FileCheck />} text="JPEG Export" />
                </div>

                {/* Footer */}
                <p className="text-slate-600 text-sm mt-12">
                    Your photos never leave your device. All processing happens locally using WebAssembly.
                </p>
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors"
            whileHover={{ y: -5 }}
        >
            <div className="mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function SmallFeature({ icon, text }) {
    return (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="text-slate-600">{React.cloneElement(icon, { className: 'w-4 h-4' })}</span>
            {text}
        </div>
    );
}
