'use client';

import { useEffect, useState } from 'react';
import { Destination } from '@/types';
import { destinationService } from '@/lib/services/destinationService';
import DestinationCard from '@/components/home/DestinationCard';
import DestinationMap from '@/components/destinations/DestinationMap';
import { Loader2 } from 'lucide-react';

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-[#f0f2f5] pt-32 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-16 px-4">
                    <h2 className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs mb-3">Explore Sri Lanka</h2>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0b1315] uppercase tracking-tight mb-8">
                        The North <br />
                        <span className="text-emerald-500 italic lowercase tracking-tight">central network</span>
                    </h1>
                </div>

                {/* Interactive Map Visualization */}
                <div className="mb-32">
                    <DestinationMap />
                </div>

                {/* All Locations Section Header */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="h-20 w-[1.5px] bg-emerald-500/20 mb-10" />
                    <h2 className="text-emerald-500 font-black tracking-[0.4em] uppercase text-xs">All Locations</h2>
                </div>

                {/* Destinations Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {destinations.map((dest) => (
                            <DestinationCard
                                key={dest.id}
                                title={dest.title}
                                subtitle={dest.subtitle}
                                image={dest.image}
                                link={`/destinations/${dest.slug}`}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
