import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LiveChatWidget from '@/components/chat/LiveChatWidget';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <LiveChatWidget />
        </>
    );
}
