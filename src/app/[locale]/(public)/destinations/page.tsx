'use client';

import { useEffect, useState } from 'react';
import { Destination, Tour } from '@/types';
import { destinationService } from '@/lib/services/destinationService';
import { tourService } from '@/lib/services/tourService';
import { Loader2, Calendar, Users, ArrowRight, Compass, Sparkles, Globe } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [tours, setTours] = useState<Tour[]>([]);
    const [loadingTours, setLoadingTours] = useState(false);
    const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const data = await destinationService.getAllDestinations();
                const sorted = data.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
                setDestinations(sorted);
            } catch (error) {
                console.error('Failed to fetch destinations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (!selectedSlug || destinations.length === 0) {
            setTours([]);
            setActiveDestination(null);
            return;
        }

        const destination = destinations.find((d) => d.slug === selectedSlug);
        if (!destination) {
            setTours([]);
            setActiveDestination(null);
            return;
        }

        setActiveDestination(destination);

        const fetchTours = async () => {
            setLoadingTours(true);
            try {
                const data = await tourService.getToursByDestination(destination.id);
                // Only show top 4
                setTours(data.slice(0, 4));
            } catch (error) {
                console.error('Failed to fetch tours:', error);
                setTours([]);
            } finally {
                setLoadingTours(false);
            }
        };
        fetchTours();
    }, [selectedSlug, destinations]);

    return (
        <div className="min-h-screen bg-[#f0f2f5] pt-32 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-24 px-4 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-emerald-500 font-bold tracking-[0.4em] uppercase text-[10px] mb-4">Discover Your Next Adventure</h2>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-[#0b1315] uppercase tracking-tighter leading-[0.85] mb-8">
                            Curated <br />
                            <span className="text-emerald-500 italic lowercase tracking-tighter">Destinations</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                            From the misty highlands to the sun-drenched coasts, explore the wild heart of Sri Lanka through our hand-picked safari locations.
                        </p>
                    </motion.div>
                </div>

                {/* Destinations Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                        {destinations.map((dest, index) => (
                            <motion.div
                                key={dest.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                viewport={{ once: true }}
                                className={`group relative h-[500px] rounded-[3rem] overflow-hidden bg-white border border-gray-100 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-3`}
                            >
                                <Image 
                                    src={dest.image} 
                                    alt={dest.title} 
                                    fill 
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1315]/95 via-[#0b1315]/20 to-transparent" />
                                
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="h-[1px] w-8 bg-emerald-500" />
                                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
                                            {dest.subtitle || 'Wilderness'}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none group-hover:text-emerald-400 transition-colors">
                                        {dest.title}
                                    </h3>
                                    <p className="text-gray-300 text-sm font-medium line-clamp-2 mb-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                        {dest.description}
                                    </p>
                                    <Link 
                                        href={`/destinations/${dest.slug}`}
                                        className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-xl w-fit px-8 py-4 rounded-full border border-white/20 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all"
                                    >
                                        Explore Destination <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}


                {/* Dynamic Tours Section */}
                <div id="excursions-section" className="mb-24 flex flex-col items-center">
                    <div className="h-20 w-[1.5px] bg-emerald-500/20 mb-8" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedSlug}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <h2 className="text-emerald-500 font-black tracking-[0.4em] uppercase text-[10px] transition-all mb-4">
                                {selectedSlug && activeDestination 
                                    ? `Exclusive Experiences` 
                                    : 'Awaiting Discovery'}
                            </h2>
                            <h3 className="text-4xl md:text-6xl font-black text-[#0b1315] uppercase tracking-tighter">
                                {selectedSlug && activeDestination 
                                    ? activeDestination.title 
                                    : 'Quick Tour Preview'}
                            </h3>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Tours Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                ) : !selectedSlug ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Compass className="w-12 h-12 text-gray-200 mb-4 animate-spin-slow" />
                        <p className="text-gray-400 font-medium max-w-sm">
                            Scroll through our featured tours below or click on a destination card to see its full gallery and details.
                        </p>
                    </div>
                ) : loadingTours ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                ) : tours.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tours.map((tour) => (
                            <Link key={tour.id} href={`/tours/${tour.id}`} className="group h-full">
                                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] transition-all duration-500 flex flex-col h-full">
                                    <div className="relative h-48 overflow-hidden shrink-0">
                                        <Image
                                            src={tour.images[0] || activeDestination?.image || '/placeholder.jpg'}
                                            alt={tour.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full shadow-lg">
                                            <span className="text-emerald-400 font-black text-xs">${tour.price}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex flex-col flex-1">
                                        <h4 className="text-sm font-black text-[#0b1315] uppercase tracking-tight line-clamp-2 mb-4 group-hover:text-emerald-600 transition-colors">
                                            {tour.title}
                                        </h4>
                                        <div className="flex items-center gap-4 text-gray-500 mb-6 mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{tour.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{tour.max_guests} Guests</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 group/btn">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 transition-colors">
                                                Discover
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover/btn:bg-emerald-500 transition-colors">
                                                <ArrowRight size={14} className="text-emerald-500 group-hover/btn:text-white transform group-hover/btn:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200"
                    >
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <Compass className="w-8 h-8 text-emerald-300 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-[#0b1315] uppercase tracking-tighter mb-3">No Active Excursions</h3>
                        <p className="text-gray-500 font-medium text-sm max-w-sm">
                            Our explorers are currently mapping out new experiences for this region. Check back soon.
                        </p>
                    </motion.div>
                )}
                
                {tours.length >= 4 && selectedSlug && (
                    <div className="mt-12 text-center">
                        <Link href={`/destinations/${selectedSlug}`} className="inline-flex items-center gap-3 bg-white border border-gray-200 text-[#0b1315] font-black uppercase tracking-[0.15em] text-[10px] px-8 py-3.5 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm hover:shadow-md">
                            View All For {activeDestination?.title}
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
