'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Destination, Tour } from '@/types';
import { destinationService } from '@/lib/services/destinationService';
import { tourService } from '@/lib/services/tourService';
import { Loader2, MapPin, Calendar, Users, ArrowRight, Play, Maximize, Compass, Sparkles, Globe, Camera, Sun, CloudRain, Wind, Mountain, PawPrint, Info, Clock, Thermometer } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';

export default function DestinationDetail() {
    const params = useParams();
    const slug = params.slug as string;

    const [destination, setDestination] = useState<Destination | null>(null);
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const destData = await destinationService.getDestinationBySlug(slug);
                setDestination(destData);
                setActiveImage(destData.image);

                const toursData = await tourService.getToursByDestination(destData.id);
                setTours(toursData);
            } catch (error) {
                console.error('Error fetching destination data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Experience</span>
                </div>
            </div>
        );
    }

    if (!destination) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
                    <Link href="/destinations" className="text-emerald-600 font-semibold hover:underline">
                        Back to all destinations
                    </Link>
                </div>
            </div>
        );
    }

    const galleryImages = [
        destination.image,
        ...tours.flatMap(t => t.images)
    ].filter((img, i, self) => self.indexOf(img) === i).slice(0, 12);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans">
            {/* Immersive Hero Section */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={activeImage || destination.image}
                            alt={destination.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1315] via-[#0b1315]/20 to-transparent" />
                
                {/* Floating Navigation Sidebar */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-20">
                    {galleryImages.slice(0, 5).map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImage(img)}
                            className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-110 ${activeImage === img ? 'border-emerald-500 scale-125 shadow-xl shadow-emerald-500/20' : 'border-white/20 opacity-50 hover:opacity-100'}`}
                        >
                            <Image src={img} alt="thumbnail" fill className="object-cover" />
                        </button>
                    ))}
                    <div className="h-20 w-[1px] bg-white/20 mx-auto mt-4" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-[1px] w-12 bg-emerald-500" />
                                <h4 className="text-emerald-400 font-black uppercase text-xs tracking-[0.4em]">Wilderness Unveiled</h4>
                            </div>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.8] max-w-4xl">
                                {destination.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-2 text-white/80 font-bold uppercase text-[10px] tracking-[0.2em] bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    {destination.subtitle || 'North Central Region'}
                                </div>
                                <div className="flex items-center gap-2 text-white/80 font-bold uppercase text-[10px] tracking-[0.2em] bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                                    <Compass className="w-4 h-4 text-emerald-500" />
                                    {tours.length} Experiences Available
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Detailed Content Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left: Main Content */}
                    <div className="lg:col-span-8 space-y-24">
                        
                        {/* Narrative Section */}
                        <div className="bg-white rounded-[4rem] p-12 lg:p-16 shadow-2xl shadow-[#0b1315]/5 border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="text-emerald-500 w-5 h-5" />
                                <h2 className="text-2xl font-black text-[#0b1315] uppercase tracking-tight">The Story of {destination.title}</h2>
                            </div>
                            <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-medium mb-10">
                                {destination.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-50">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Wildlife Chance</span>
                                    <p className="text-[#0b1315] font-black text-sm uppercase">Exceptional</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Best Season</span>
                                    <p className="text-[#0b1315] font-black text-sm uppercase">Year Round</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Landscape</span>
                                    <p className="text-[#0b1315] font-black text-sm uppercase">Tropical Wilderness</p>
                                </div>
                            </div>
                        </div>

                        {/* Climate & Insights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Weather & Climate */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-xl shadow-emerald-500/5 group hover:bg-[#0b1315] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:rotate-12 transition-all duration-500">
                                        <Sun className="w-7 h-7 text-amber-500 group-hover:text-white" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Average Temp</span>
                                        <p className="text-2xl font-black text-[#0b1315] group-hover:text-white transition-colors">29°C</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-[#0b1315] group-hover:text-white uppercase tracking-tighter mb-4 transition-colors">Climate & Weather</h3>
                                <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium leading-relaxed transition-colors">
                                    Tropical and dry seasons. Best visited from Feb-Oct for clarity and wildlife visibility at water holes.
                                </p>
                            </motion.div>

                            {/* Landscape & Terrain */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-xl shadow-emerald-500/5 group hover:bg-[#0b1315] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:-rotate-12 transition-all duration-500">
                                        <Mountain className="w-7 h-7 text-emerald-500 group-hover:text-white" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Eco-System</span>
                                        <p className="text-2xl font-black text-[#0b1315] group-hover:text-white transition-colors">Lush Scrub</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-[#0b1315] group-hover:text-white uppercase tracking-tighter mb-4 transition-colors">Wild Terrain</h3>
                                <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium leading-relaxed transition-colors">
                                    Features complex ecosystems of secondary forest, ancient tanks, and seasonal villu wetlands.
                                </p>
                            </motion.div>

                            {/* Wildlife Profile */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-xl shadow-emerald-500/5 group hover:bg-[#0b1315] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-500">
                                        <PawPrint className="w-7 h-7 text-orange-500 group-hover:text-white" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Density</span>
                                        <p className="text-2xl font-black text-[#0b1315] group-hover:text-white transition-colors">High (Big 3)</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-[#0b1315] group-hover:text-white uppercase tracking-tighter mb-4 transition-colors">Wildlife Highlights</h3>
                                <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium leading-relaxed transition-colors">
                                    The primary home of the Ceylon Leopard, Sloth Bear, and vast Asian Elephant herds.
                                </p>
                            </motion.div>

                            {/* Essential Gear */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-xl shadow-emerald-500/5 group hover:bg-[#0b1315] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:rotate-12 transition-all duration-500">
                                        <Wind className="w-7 h-7 text-blue-500 group-hover:text-white" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Essentials</span>
                                        <p className="text-2xl font-black text-[#0b1315] group-hover:text-white transition-colors">Explorer Kit</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-[#0b1315] group-hover:text-white uppercase tracking-tighter mb-4 transition-colors">What to Carry</h3>
                                <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium leading-relaxed transition-colors">
                                    Pack lightweight cottons, binoculars, a long lens camera, and plenty of hydration for the trails.
                                </p>
                            </motion.div>
                        </div>

                        {/* Immersive Video Player */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Visual Journey</span>
                                    <h3 className="text-4xl font-black text-[#0b1315] uppercase tracking-tighter">Vibe Reveal</h3>
                                </div>
                            </div>
                            <div className="relative aspect-video rounded-[4rem] overflow-hidden bg-[#0b1315] group cursor-pointer shadow-3xl shadow-emerald-500/10">
                                <iframe 
                                    className="absolute inset-0 w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                    src="https://www.youtube.com/embed/Sc6S8xK8R-Q?autoplay=1&mute=1&loop=1&playlist=Sc6S8xK8R-Q&controls=0&showinfo=0" 
                                    title="YouTube video player" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-500 shadow-2xl">
                                        <Play className="text-white w-10 h-10 ml-1 fill-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gallery Grid */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Snapshot Series</span>
                                    <h3 className="text-4xl font-black text-[#0b1315] uppercase tracking-tighter">The Gallery</h3>
                                </div>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0b1315]/40 hover:text-emerald-600 transition-colors">
                                    <Camera className="w-4 h-4" /> View All 50+
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {galleryImages.map((img, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 0.98 }}
                                        className={`relative overflow-hidden rounded-[2.5rem] cursor-zoom-in bg-gray-200 ${
                                            i % 3 === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                                        }`}
                                    >
                                        <Image src={img} alt={`Gallery ${i}`} fill className="object-cover hover:scale-110 transition-transform duration-1000" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Experiences Section */}
                        <div id="tours-section" className="space-y-16 py-12">
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-20 w-[1px] bg-emerald-500/20" />
                                <h3 className="text-4xl md:text-6xl font-black text-[#0b1315] uppercase tracking-tighter text-center">
                                    Curated <br /> Experiences
                                </h3>
                            </div>

                            {tours.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {tours.map((tour) => (
                                        <Link key={tour.id} href={`/tours/${tour.id}`}>
                                            <div className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 hover:border-emerald-500/10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700">
                                                <div className="relative h-72 overflow-hidden">
                                                    <Image
                                                        src={tour.images[0] || destination.image}
                                                        alt={tour.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                    <div className="absolute top-8 right-8 px-6 py-2.5 bg-[#0b1315]/90 backdrop-blur-xl rounded-full">
                                                        <span className="text-emerald-400 font-black text-sm tracking-tight">${tour.price}</span>
                                                    </div>
                                                </div>
                                                <div className="p-10 space-y-8">
                                                    <h4 className="text-2xl font-black text-[#0b1315] uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">
                                                        {tour.title}
                                                    </h4>
                                                    <div className="flex items-center gap-8 text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-emerald-500" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{tour.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} className="text-emerald-500" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{tour.max_guests} Guests</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 group/btn">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Explore Detail</span>
                                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover/btn:bg-emerald-500 transition-all">
                                                            <ArrowRight size={18} className="text-emerald-600 group-hover/btn:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-24 bg-white rounded-[4rem] text-center border border-dashed border-gray-200">
                                    <MapPin className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                                    <p className="text-gray-400 font-black uppercase text-xs tracking-[0.4em]">Design in progress</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sticky Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <div className="bg-[#0b1315] p-12 rounded-[4rem] text-white space-y-10 shadow-3xl shadow-[#0b1315]/30">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center">
                                <Globe className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Tailor Your <br /> Wildlife Story</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Can&apos;t find exactly what you looking for? Let our wildlife experts curate a custom itinerary specifically for {destination.title}.
                                </p>
                            </div>
                            <Link href="/contact" className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-[#0b1315] rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-emerald-400">
                                Start Planning
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            
                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <Sparkles size={16} className="text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expert Guided Tours</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <Users size={16} className="text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Small Group Groups</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
