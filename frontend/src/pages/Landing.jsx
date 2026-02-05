
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, MessageSquare, Mic, ArrowRight, Gamepad2, Zap } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import BlurInText from '../components/ui/BlurInText';
import SpotlightCard from '../components/ui/SpotlightCard';

export default function Landing() {
    const navigate = useNavigate();

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 relative">
            <AnimatedBackground />

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Gamepad2 className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Onyx
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-white font-medium transition-colors">
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-5 py-2.5 bg-white text-slate-950 rounded-full font-bold hover:bg-cyan-50 transition-colors shadow-lg shadow-white/10"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Removed static blobs in favor of AnimatedBackground */}

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold mb-8 backdrop-blur-sm">
                            <Zap size={16} className="fill-cyan-400" />
                            <span>The Next Gen Esports Platform</span>
                        </motion.div>

                        <div className="mb-8">
                            <BlurInText
                                text="Dominate the Competition"
                                className="text-5xl lg:text-8xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400"
                            />
                        </div>


                        <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Join elite tournaments, build your dream team, and rise through the ranks.
                            The ultimate competitive hub for professional gamers.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group"
                            >
                                Start Competing <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/tournaments')}
                                className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                Browse Tournaments
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Everything you need to win</h2>
                        <p className="text-slate-400">Professional tools for professional players</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Trophy className="text-yellow-400" size={32} />}
                            title="Pro Tournaments"
                            desc="Automated brackets, instant payouts, and real-time match tracking."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Users className="text-cyan-400" size={32} />}
                            title="Team Management"
                            desc="Recruit players, manage rosters, and track team performance stats."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="text-green-400" size={32} />}
                            title="Live Chat"
                            desc="Connect with your team and opponents in real-time encrypted channels."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<Mic className="text-purple-400" size={32} />}
                            title="Voice Channels"
                            desc="Low-latency voice rooms for crystal clear tactical communication."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-12 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                        <h2 className="text-4xl font-bold mb-6">Ready to become a legend?</h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            Join thousands of players already competing on Onyx. Your journey to the top starts now.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold hover:bg-cyan-50 transition-colors shadow-2xl shadow-cyan-500/20"
                        >
                            Join Now - It's Free
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950 text-slate-500 text-center">
                <p>&copy; {new Date().getFullYear()} Onyx Esports. Crafted for Gamers.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <SpotlightCard className="h-full p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-cyan-500/30 transition-all group">
                <div className="mb-4 p-3 bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </SpotlightCard>
        </motion.div>
    );
}
