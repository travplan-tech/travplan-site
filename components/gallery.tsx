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
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880469/TravPlan/stock/unsplash-1518548419970-58e3b4079ab2.jpg", name: "Indonesia" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880470/TravPlan/stock/unsplash-1596422846543-75c6fc197f07.jpg", name: "Malaysia" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880471/TravPlan/stock/unsplash-1512453979798-5ea266f8880c.jpg", name: "Dubai" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880472/TravPlan/stock/unsplash-1528127269322-539801943592.jpg", name: "Vietnam" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880473/TravPlan/stock/unsplash-1573843981267-be1999ff37cd.jpg", name: "Maldives" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880474/TravPlan/stock/unsplash-1483070472046-4defb528eff3.jpg", name: "Singapore" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880475/TravPlan/stock/unsplash-1534008897995-27a23e859048.jpg", name: "Thailand" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880476/TravPlan/stock/unsplash-1497256654106-4a29efafb831.jpg", name: "Andaman" }
        ],
        stripTwo: [
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880477/TravPlan/stock/unsplash-1512343879784-a960bf40e7f2.jpg", name: "Goa" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880478/TravPlan/stock/unsplash-1620103143245-9efb3e4a7553.jpg", name: "Gujarat" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880481/TravPlan/stock/unsplash-1581791534721-e599df4417f7.jpg", name: "Himachal" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880482/TravPlan/stock/unsplash-1600100397849-3a782cfd8492.jpg", name: "Karnataka" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880484/TravPlan/stock/unsplash-1715457573748-8e8a70b2c1be.jpg", name: "Kashmir" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880485/TravPlan/stock/unsplash-1602216056096-3b40cc0c9944.jpg", name: "Kerala" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880486/TravPlan/stock/unsplash-1631867675167-90a456a90863.jpg", name: "Rajasthan" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880488/TravPlan/stock/unsplash-1585914285309-4b1fe30b53ed.jpg", name: "Sikkim" }
        ],
        stripThree: [
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880489/TravPlan/stock/unsplash-1634148551170-d37d021e0cc9.jpg", name: "Dubai" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880491/TravPlan/stock/unsplash-1547378809-db8f9515a63b.jpg", name: "Uttarakhand" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880492/TravPlan/stock/unsplash-1566914447826-bf04e54bf1be.jpg", name: "Malaysia" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880495/TravPlan/stock/unsplash-1600402808924-9c591a6dace8.jpg", name: "Sikkim" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880496/TravPlan/stock/unsplash-1544644181-1484b3fdfc62.jpg", name: "Indonesia" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880497/TravPlan/stock/unsplash-1525625293386-3f8f99389edd.jpg", name: "Singapore" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880498/TravPlan/stock/unsplash-1467377791767-c929b5dc9a23.jpg", name: "Maldives" },
            { src: "https://res.cloudinary.com/dcolmsvtp/image/upload/f_auto,q_auto,w_1000,c_limit/v1791880499/TravPlan/stock/unsplash-1589983846997-04788035bc83.jpg", name: "Kerala" }
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
