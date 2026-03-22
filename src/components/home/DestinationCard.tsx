'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface DestinationCardProps {
    title: string;
    subtitle: string;
    image: string;
    link: string;
}

export default function DestinationCard({ title, subtitle, image, link }: DestinationCardProps) {
    return (
        <Link href={link} className="block group">
            <motion.div
                whileHover={{ y: -8 }}
                className="relative rounded-[2rem] overflow-hidden aspect-[9/16] bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {image && (image.startsWith('http') || image.startsWith('/')) ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover object-[50%_65%] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800" />
                    )}
                </div>

                {/* Gradient Overlay for Text Readability - Dark at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col items-start text-white">
                    <h3 className="text-2xl font-black mb-2 uppercase leading-snug tracking-tight">{title}</h3>
                    <p className="text-sm font-medium text-gray-300 mb-6">{subtitle}</p>
                    <div className="bg-white text-[#0b1315] text-[10px] font-black uppercase py-4 px-8 rounded-2xl inline-block shadow-lg group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 tracking-[0.2em]">
                        View Packages
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
