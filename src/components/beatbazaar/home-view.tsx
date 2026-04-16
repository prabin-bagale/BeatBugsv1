'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Music2,
  TrendingUp,
  Users,
  Headphones,
  Zap,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Clock,
  FileAudio,
  PlayCircle,
  ShieldCheck,
  Wallet,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BeatCard } from './beat-card';
import { useAppStore, type Beat, type User } from '@/stores/beatbazaar-store';

/* Floating music symbols for the hero background */
type MusicSymbol = {
  symbol: string;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
  floatRange: number;
};

const MUSIC_SYMBOLS: MusicSymbol[] = [
  { symbol: '♪', size: 32, x: 5, y: 15, delay: 0, duration: 6, color: 'text-emerald-400', floatRange: 18 },
  { symbol: '♫', size: 28, x: 15, y: 75, delay: 1.5, duration: 7, color: 'text-teal-400', floatRange: 14 },
  { symbol: '🎵', size: 26, x: 85, y: 20, delay: 0.8, duration: 8, color: '', floatRange: 20 },
  { symbol: '🎶', size: 30, x: 90, y: 60, delay: 2.2, duration: 7, color: '', floatRange: 16 },
  { symbol: '♩', size: 24, x: 75, y: 80, delay: 1.2, duration: 6.5, color: 'text-emerald-300', floatRange: 12 },
  { symbol: '♬', size: 36, x: 8, y: 50, delay: 3, duration: 9, color: 'text-teal-300', floatRange: 22 },
  { symbol: '🎵', size: 22, x: 70, y: 10, delay: 0.5, duration: 7.5, color: '', floatRange: 15 },
  { symbol: '♪', size: 20, x: 45, y: 5, delay: 2.8, duration: 6, color: 'text-emerald-500', floatRange: 10 },
  { symbol: '🎼', size: 24, x: 35, y: 88, delay: 1.8, duration: 8, color: '', floatRange: 16 },
  { symbol: '♫', size: 34, x: 93, y: 40, delay: 0.3, duration: 7, color: 'text-teal-400', floatRange: 20 },
  { symbol: '♪', size: 18, x: 25, y: 30, delay: 4, duration: 6.5, color: 'text-emerald-400', floatRange: 10 },
  { symbol: '🔊', size: 22, x: 55, y: 3, delay: 1, duration: 7.5, color: '', floatRange: 14 },
  { symbol: '♬', size: 26, x: 80, y: 50, delay: 2.5, duration: 8, color: 'text-teal-300', floatRange: 18 },
  { symbol: '🎤', size: 20, x: 2, y: 80, delay: 3.5, duration: 7, color: '', floatRange: 12 },
  { symbol: '♪', size: 28, x: 60, y: 85, delay: 0.7, duration: 6, color: 'text-emerald-500', floatRange: 15 },
  { symbol: '🎧', size: 22, x: 42, y: 70, delay: 2, duration: 8.5, color: '', floatRange: 14 },
  { symbol: '♫', size: 20, x: 18, y: 8, delay: 1.3, duration: 7, color: 'text-teal-500', floatRange: 12 },
  { symbol: '🎹', size: 20, x: 95, y: 85, delay: 3.2, duration: 9, color: '', floatRange: 10 },
  { symbol: '♪', size: 24, x: 50, y: 42, delay: 0.2, duration: 6.5, color: 'text-emerald-300', floatRange: 16 },
  { symbol: '♬', size: 30, x: 30, y: 55, delay: 1.7, duration: 7.5, color: 'text-teal-400', floatRange: 18 },
];

function FloatingMusicSymbol({ symbol, size, x, y, delay, duration, color, floatRange }: MusicSymbol) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 0.5, 0.7, 0.5, 0.3, 0.5, 0],
        scale: [0, 1.4, 1, 1.2, 0.9, 1.1, 0],
        y: [0, -floatRange, floatRange * 0.5, -floatRange * 0.7, floatRange * 0.3, -floatRange * 0.4, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <span
        className={`font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] ${color}`}
        style={{ fontSize: size, lineHeight: 1 }}
      >
        {symbol}
      </span>
    </motion.div>
  );
}

/* Pulsing equalizer bars */
function EqualizerBars() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-8 pointer-events-none">
      {[0.4, 0.7, 1, 0.6, 0.8, 0.5, 0.9, 0.3, 0.7, 0.55, 0.85, 0.45, 0.65, 0.35, 0.75].map((maxH, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-emerald-500/25"
          animate={{
            height: [4, maxH * 28 + 4, 4],
          }}
          transition={{
            duration: 1.2 + (i * 0.1),
            delay: i * 0.08,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function HomeView() {
  const { setView, selectBeat, selectProducer, setSearchQuery, currentUser, openAuth, showToast } = useAppStore();
  const [featuredBeats, setFeaturedBeats] = useState<Beat[]>([]);
  const [recentBeats, setRecentBeats] = useState<Beat[]>([]);
  const [topProducers, setTopProducers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselRef, setCarouselRef] = useState<HTMLDivElement | null>(null);
  const [activeProducerSlide, setActiveProducerSlide] = useState(0);
  const [isProducerHovered, setIsProducerHovered] = useState(false);
  const producerScrollRef = useRef<HTMLDivElement | null>(null);
  const producerAutoSlideRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [beatsRes, recentRes, producersRes] = await Promise.all([
          fetch('/api/beats?sortBy=popular&limit=6'),
          fetch('/api/beats?sortBy=newest&limit=6'),
          fetch('/api/auth?role=producer'),
        ]);

        const beatsData = await beatsRes.json();
        const recentData = await recentRes.json();
        const producersData = await producersRes.json();

        setFeaturedBeats(beatsData.beats || []);
        setRecentBeats(recentData.beats || []);
        setTopProducers((producersData.users || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef) return;
    const scrollAmount = 320;
    carouselRef.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Auto-advance producer carousel
  const producerTotalSlides = Math.max(topProducers.length, 1);

  const startProducerAutoSlide = useCallback(() => {
    if (producerAutoSlideRef.current) clearInterval(producerAutoSlideRef.current);
    producerAutoSlideRef.current = setInterval(() => {
      setActiveProducerSlide((prev) => (prev + 1) % producerTotalSlides);
      if (producerScrollRef.current) {
        const nextSlide = ((activeProducerSlide + 1) % producerTotalSlides);
        const cardWidth = 280;
        producerScrollRef.current.scrollTo({
          left: nextSlide * cardWidth,
          behavior: 'smooth',
        });
      }
    }, 4000);
  }, [producerTotalSlides, activeProducerSlide]);

  useEffect(() => {
    if (topProducers.length > 0) {
      startProducerAutoSlide();
    }
    return () => {
      if (producerAutoSlideRef.current) clearInterval(producerAutoSlideRef.current);
    };
  }, [topProducers.length, startProducerAutoSlide]);

  const scrollProducer = (dir: 'left' | 'right') => {
    if (!producerScrollRef.current) return;
    const slideWidth = 280;
    if (dir === 'left') {
      const newSlide = activeProducerSlide > 0 ? activeProducerSlide - 1 : producerTotalSlides - 1;
      setActiveProducerSlide(newSlide);
      producerScrollRef.current.scrollTo({ left: newSlide * slideWidth, behavior: 'smooth' });
    } else {
      const newSlide = (activeProducerSlide + 1) % producerTotalSlides;
      setActiveProducerSlide(newSlide);
      producerScrollRef.current.scrollTo({ left: newSlide * slideWidth, behavior: 'smooth' });
    }
    // Restart auto-slide timer on manual navigation
    if (producerAutoSlideRef.current) clearInterval(producerAutoSlideRef.current);
    startProducerAutoSlide();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

        {/* Floating music symbols */}
        {MUSIC_SYMBOLS.map((sym, i) => (
          <FloatingMusicSymbol key={i} {...sym} />
        ))}

        {/* Pulsing equalizer bars at bottom */}
        <EqualizerBars />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-semibold">
              <Zap className="w-3 h-3 mr-1.5" />
              Welcome to BeatBugs
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-3">
              Find Your Next
              <br />
              <span className="gradient-text">Hit Beat</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
              Buy and sell beats with local payments, instant delivery, and legal licensing.
              Built for Nepal&apos;s music creators.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setView('browse')}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 px-6 text-sm shadow-lg shadow-emerald-500/20"
              >
                <Headphones className="w-5 h-5 mr-2" />
                Browse Beats
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (!currentUser) {
                    showToast('Please sign up as a producer to sell beats', 'info');
                    openAuth('signup');
                    return;
                  }
                  if (currentUser.role === 'producer') {
                    setView('producer-dashboard');
                  } else {
                    showToast('You need a producer account to sell beats', 'info');
                  }
                }}
                className="border-border/50 h-10 px-6 text-sm hover:bg-secondary"
              >
                Sell Your Beats
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Beats Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Trending Beats</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Most popular beats right now</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={setCarouselRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? [...Array(6)].map((_, i) => (
                <Card key={i} className="flex-shrink-0 w-60 bg-card border-border/50 overflow-hidden">
                  <div className="aspect-square bg-secondary animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded animate-pulse" />
                    <div className="h-3 bg-secondary rounded animate-pulse w-2/3" />
                  </div>
                </Card>
              ))
            : featuredBeats.map((beat, i) => (
                <div key={beat.id} className="flex-shrink-0 w-60 snap-start">
                  <BeatCard beat={beat} index={i} />
                </div>
              ))}
        </div>
      </section>

      {/* Recently Added */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Recently Added
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fresh beats just uploaded by producers</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-500 hover:text-emerald-400 text-xs"
            onClick={() => {
              setSearchQuery('');
              useAppStore.getState().setSortBy('newest');
              setView('browse');
            }}
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {recentBeats.length === 0 && !loading ? (
          <Card className="bg-card border-border/50 p-8 text-center">
            <Music2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">No beats yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to upload a beat!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading
              ? [...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-border/50 overflow-hidden">
                    <div className="aspect-square bg-secondary animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-secondary rounded animate-pulse" />
                      <div className="h-3 bg-secondary rounded animate-pulse w-2/3" />
                    </div>
                  </Card>
                ))
              : recentBeats.map((beat, i) => (
                  <BeatCard key={beat.id} beat={beat} index={i} />
                ))}
          </div>
        )}
      </section>

      {/* Top Producers - Round Portrait Slider */}
      <section className="relative overflow-hidden">
        {/* Dark textured background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge className="mb-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-semibold">
                  <Users className="w-3 h-3 mr-1.5" />
                  Featured Creators
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold">Top Producers</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Trusted by artists across Nepal</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-emerald-500/50"
                  onClick={() => scrollProducer('left')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-emerald-500/50"
                  onClick={() => scrollProducer('right')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              className="overflow-x-auto snap-x snap-mandatory pb-2"
              ref={producerScrollRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseEnter={() => setIsProducerHovered(true)}
              onMouseLeave={() => setIsProducerHovered(false)}
            >
              <div className="flex gap-6">
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-64 flex flex-col items-center gap-3 p-4">
                        <div className="w-28 h-28 rounded-full bg-zinc-800 animate-pulse" />
                        <div className="h-4 bg-zinc-800 rounded animate-pulse w-24" />
                        <div className="h-3 bg-zinc-800 rounded animate-pulse w-32" />
                      </div>
                    ))
                  : topProducers.map((producer, i) => (
                      <motion.div
                        key={producer.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex-shrink-0 w-64 snap-center"
                      >
                        <div
                          className="flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer group transition-all duration-300 hover:bg-zinc-800/50"
                          onClick={() => selectProducer(producer.id)}
                        >
                          {/* Round portrait */}
                          <div className="relative">
                            <motion.div
                              className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-zinc-700/50 group-hover:ring-emerald-500/60 transition-all duration-500"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img
                                src={producer.avatar || `https://picsum.photos/seed/${producer.id}/200/200`}
                                alt={producer.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </motion.div>
                            {/* Verified badge */}
                            {producer.verified && (
                              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-zinc-900 shadow-lg">
                                <BadgeCheck className="w-4 h-4 text-black" />
                              </div>
                            )}
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 blur-xl transition-all duration-500 -z-10 scale-110" />
                          </div>

                          {/* Info */}
                          <div className="text-center">
                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {producer.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Beat Producer</p>
                          </div>

                          {/* Testimonial-style quote */}
                          <div className="relative mt-1 px-3">
                            <Quote className="w-4 h-4 text-emerald-500/30 absolute -top-1 -left-1" />
                            <p className="text-[11px] text-zinc-400 italic leading-relaxed pl-2">
                              {producer.bio || 'Creating unique sounds that inspire artists worldwide.'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>

            {/* Slide indicator dots */}
            {topProducers.length > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {topProducers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveProducerSlide(i);
                      if (producerScrollRef.current) {
                        producerScrollRef.current.scrollTo({ left: i * 280, behavior: 'smooth' });
                      }
                      if (producerAutoSlideRef.current) clearInterval(producerAutoSlideRef.current);
                      startProducerAutoSlide();
                    }}
                    className="transition-all duration-300"
                  >
                    <motion.div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeProducerSlide === i
                          ? 'bg-emerald-500 w-6 shadow-lg shadow-emerald-500/30'
                          : 'bg-zinc-700 w-2 hover:bg-zinc-500'
                      }`}
                      layout
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Beats', value: '18+', icon: Music2 },
              { label: 'Producers', value: '5', icon: Users },
              { label: 'Transactions', value: '100+', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="w-5 h-5 text-emerald-500" />
                <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-semibold">
              <Zap className="w-3 h-3 mr-1.5" />
              Simple Process
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold">How It Works</h2>
            <p className="text-xs text-muted-foreground mt-1">Four simple steps to get your next hit</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 -translate-y-1/2 z-0">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
              {[
                { Icon: FileAudio, label: 'Create & Upload', desc: 'Producers upload their beats with tags and pricing', gradient: 'from-emerald-500 to-teal-600', delay: 0 },
                { Icon: PlayCircle, label: 'Discover & Preview', desc: 'Browse, search, and preview beats instantly', gradient: 'from-amber-500 to-orange-600', delay: 0.1 },
                { Icon: ShieldCheck, label: 'License & Pay', desc: 'Choose your license tier and pay securely', gradient: 'from-purple-500 to-fuchsia-600', delay: 0.2 },
                { Icon: Wallet, label: 'Download & Earn', desc: 'Get instant delivery and producers earn revenue', gradient: 'from-pink-500 to-rose-600', delay: 0.3 },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Circle with gradient and lucide icon */}
                  <div className="relative mb-3">
                    <motion.div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                      animate={{ boxShadow: [`0 4px 15px rgba(16,185,129,0.2)`, `0 8px 30px rgba(16,185,129,0.4)`, `0 4px 15px rgba(16,185,129,0.2)`] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <step.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                    </motion.div>
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-emerald-500">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-white mb-1">{step.label}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed max-w-[160px]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20 overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Ready to Sell Your Beats?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Join Nepal&apos;s growing community of music producers. Upload your beats, 
              set your prices, and start earning today.
            </p>
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 px-6"
              onClick={() => {
                if (!currentUser) {
                  showToast('Please sign up as a producer to sell beats', 'info');
                  openAuth('signup');
                  return;
                }
                if (currentUser.role === 'producer') {
                  setView('producer-dashboard');
                } else {
                  showToast('You need a producer account to sell beats', 'info');
                }
              }}
            >
              <Music2 className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
