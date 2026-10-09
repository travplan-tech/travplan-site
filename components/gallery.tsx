'use client';
import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

export default function Gallery() {
    const stripOneRef = useRef<HTMLDivElement>(null);
    const stripTwoRef = useRef<HTMLDivElement>(null);
    const stripThreeRef = useRef<HTMLDivElement>(null);
    const animationIdsRef = useRef<number[]>([]);

    // Gallery data organized by strips
    const galleryData = {
        stripOne: [
            { src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1000&auto=format&fit=crop", name: "Indonesia" },
            { src: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1000&auto=format&fit=crop&q=60", name: "Malaysia" },
            { src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop", name: "Dubai" },
            { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&auto=format&fit=crop&q=60", name: "Vietnam" },
            { src: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1000&auto=format&fit=crop&q=60", name: "Maldives" },
            { src: "https://images.unsplash.com/photo-1483070472046-4defb528eff3?w=1000&auto=format&fit=crop&q=60", name: "Singapore" },
            { src: "https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1000&auto=format&fit=crop&q=60", name: "Thailand" },
            { src: "https://images.unsplash.com/photo-1497256654106-4a29efafb831?w=1000&auto=format&fit=crop&q=60", name: "Andaman" }
        ],
        stripTwo: [
            { src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop&q=60", name: "Goa" },
            { src: "https://images.unsplash.com/photo-1620103143245-9efb3e4a7553?w=1000&auto=format&fit=crop&q=60", name: "Gujarat" },
            { src: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?w=1000&auto=format&fit=crop&q=60", name: "Himachal" },
            { src: "https://images.unsplash.com/photo-1600100397849-3a782cfd8492?w=1000&auto=format&fit=crop&q=60", name: "Karnataka" },
            { src: "https://images.unsplash.com/photo-1715457573748-8e8a70b2c1be?w=1000&auto=format&fit=crop&q=60", name: "Kashmir" },
            { src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1000&auto=format&fit=crop&q=60", name: "Kerala" },
            { src: "https://images.unsplash.com/photo-1631867675167-90a456a90863?w=1000&auto=format&fit=crop&q=60", name: "Rajasthan" },
            { src: "https://images.unsplash.com/photo-1585914285309-4b1fe30b53ed?w=1000&auto=format&fit=crop&q=60", name: "Sikkim" }
        ],
        stripThree: [
            { src: "https://images.unsplash.com/photo-1634148551170-d37d021e0cc9?w=1000&auto=format&fit=crop&q=60", name: "Dubai" },
            { src: "https://images.unsplash.com/photo-1547378809-db8f9515a63b?w=1000&auto=format&fit=crop&q=60", name: "Uttarakhand" },
            { src: "https://images.unsplash.com/photo-1566914447826-bf04e54bf1be?w=1000&auto=format&fit=crop&q=60", name: "Malaysia" },
            { src: "https://images.unsplash.com/photo-1600402808924-9c591a6dace8?w=1000&auto=format&fit=crop&q=60", name: "Sikkim" },
            { src: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=60", name: "Indonesia" },
            { src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=60", name: "Singapore" },
            { src: "https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=1000&auto=format&fit=crop&q=60", name: "Maldives" },
            { src: "https://images.unsplash.com/photo-1589983846997-04788035bc83?w=1000&auto=format&fit=crop&q=60", name: "Kerala" }
        ]
    };

    // Animation cleanup function
    const cleanupAnimations = useCallback(() => {
        animationIdsRef.current.forEach(id => {
            if (id) cancelAnimationFrame(id);
        });
        animationIdsRef.current = [];
    }, []);

    // Create smooth back-and-forth animation
    const createAnimation = useCallback((
        element: HTMLDivElement,
        startX: number,
        endX: number,
        duration: number = 15000 // 15 seconds - faster!
    ): (() => void) => {
        let startTime: number | undefined;
        let animationId: number;

        // Smooth easing function
        const easeInOutSine = (t: number): number => {
            return -(Math.cos(Math.PI * t) - 1) / 2;
        };

        const animate = (timestamp: number): void => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % (duration * 2)) / duration;

            let currentProgress: number;
            if (progress <= 1) {
                // Forward motion with easing
                currentProgress = easeInOutSine(progress);
            } else {
                // Backward motion (yoyo) with easing
                currentProgress = easeInOutSine(2 - progress);
            }

            const currentX = startX + (endX - startX) * currentProgress;
            element.style.transform = `translateX(${currentX}%)`;

            animationId = requestAnimationFrame(animate);
            if (!animationIdsRef.current.includes(animationId)) {
                animationIdsRef.current.push(animationId);
            }
        };

        animationId = requestAnimationFrame(animate);
        animationIdsRef.current.push(animationId);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                const index = animationIdsRef.current.indexOf(animationId);
                if (index > -1) {
                    animationIdsRef.current.splice(index, 1);
                }
            }
        };
    }, []);

    // Initialize animations
    const startAnimations = useCallback(() => {
        const stripOne = stripOneRef.current;
        const stripTwo = stripTwoRef.current;
        const stripThree = stripThreeRef.current;

        if (!stripOne || !stripTwo || !stripThree) return;

        cleanupAnimations();

        // Faster animations: same speed for strips 1 and 3
        createAnimation(stripOne, 5, -35, 15000);      // Moves left
        createAnimation(stripTwo, -5, 35, 16000);      // Moves right (different speed)
        createAnimation(stripThree, 5, -35, 15000);    // Moves left (same as strip 1)
    }, [createAnimation, cleanupAnimations]);

    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startAnimations();
        }, 100);

        return () => {
            clearTimeout(timer);
            cleanupAnimations();
        };
    }, [startAnimations, cleanupAnimations]);

    return (
        <section className="py-14 md:py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-9 md:mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">Gallery</p>
                <h2 className="font-heading text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 tracking-tight">
                    Moments from our trips
                </h2>
                <p className="text-sm md:text-base text-gray-600 mt-2 max-w-xl mx-auto">
                    Photographs sent in by travellers who have been out with us.
                </p>
            </div>
            <div className="gallery">
                <div className="gallery__strip" ref={stripOneRef}>
                    {galleryData.stripOne.map((photo, index) => (
                        <div key={`strip1-${index}`} className="photo">
                            <div className="photo__image">
                                <Image
                                    src={photo.src}
                                    alt={photo.name}
                                    width={550}
                                    height={200}
                                    loading="lazy"
                                    sizes="(max-width: 768px) 300px, 450px"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                            <div className="photo__name">{photo.name}</div>
                        </div>
                    ))}
                </div>
                <div className="gallery__strip" ref={stripTwoRef}>
                    {galleryData.stripTwo.map((photo, index) => (
                        <div key={`strip2-${index}`} className="photo">
                            <div className="photo__image">
                                <Image
                                    src={photo.src}
                                    alt={photo.name}
                                    width={550}
                                    height={200}
                                    loading="lazy"
                                    sizes="(max-width: 768px) 300px, 450px"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                            <div className="photo__name">{photo.name}</div>
                        </div>
                    ))}
                </div>
                <div className="gallery__strip" ref={stripThreeRef}>
                    {galleryData.stripThree.map((photo, index) => (
                        <div key={`strip3-${index}`} className="photo">
                            <div className="photo__image">
                                <Image
                                    src={photo.src}
                                    alt={photo.name}
                                    width={550}
                                    height={200}
                                    loading="lazy"
                                    sizes="(max-width: 768px) 300px, 450px"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                            <div className="photo__name">{photo.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
