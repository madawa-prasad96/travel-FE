import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, Star, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

const HERO_IMAGES = [
 // Import from public folder
 "/hero1.webp",
 "/hero2.webp",
 "/hero3.webp",
 "/hero4.webp",
 "/hero5.webp",
 "/hero6.webp",
];

const TESTIMONIALS = [
  { id: 1, name: "Sarah Johnson", role: "Adventure Enthusiast", text: "BeeTravel made planning our Sri Lanka trip incredibly easy. The map integration is precise and the route visualization is a game changer!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 2, name: "David Chen", role: "Family Traveler", text: "I loved how I could separate travel days from stay days. It kept our itinerary organized and stress-free. Highly recommended!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 3, name: "Emily Davis", role: "Solo Backpacker", text: "The best route planning tool I've used. Simple, beautiful, and effective. Being able to see the full route before booking gave me peace of mind.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 4, name: "Michael Brown", role: "Road Tripper", text: "Planning a 10-day road trip was a breeze. The ability to add stops on the fly and see the polyline updates instantly is fantastic.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 5, name: "Jessica Wilson", role: "Digital Nomad", text: "I use BeeTravel for all my weekend getaways. It's intuitive and the UI looks stunning. Finally, a travel app that feels modern.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 6, name: "Robert Taylor", role: "Business Traveler", text: "Efficient and reliable. I map out my client visits using the stop picker. Saves me so much time on the road.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 7, name: "Lisa Anderson", role: "Photography Tour", text: "We needed to hit specific spots for sunrise. BeeTravel helped us sequence our stops perfectly. A must-have for photographers.", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 8, name: "James Martin", role: "Cycling Group", text: "Great for planning our cycling routes. The elevation data (hoped for in future!) and distance/stop management is solid.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 9, name: "Sophie Moore", role: "History Buff", text: "Organizing historical site visits was never this clean. The 'Stay Day' feature perfectly captures our rest days in ancient cities.", avatar: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
  { id: 10, name: "Daniel White", role: "Food Critic", text: "I planned a food tour across the coast. BeeTravel's map search made finding and adding restaurants to my route super quick.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" }
];

export const LandingPage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Testimonial Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
        nextTestimonial();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const getVisibleTestimonials = () => {
    const count = TESTIMONIALS.length;
    // We want 3 items: previous, current, next
    const prevIndex = (testimonialIndex - 1 + count) % count;
    const nextIndex = (testimonialIndex + 1) % count;
    return [
      { ...TESTIMONIALS[prevIndex], position: 'left' },
      { ...TESTIMONIALS[testimonialIndex], position: 'center' },
      { ...TESTIMONIALS[nextIndex], position: 'right' }
    ];
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {HERO_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentHeroIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Plan Your Perfect <span className="text-amber-400">Journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
            The smartest way to organize your multi-stop trips. Visualize routes, manage stops, and travel with confidence.
          </p>
          <Link 
            to="/plan"
            className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
          >
            Start Planning Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose BeeTravel?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We simplify complex travel planning into an intuitive, visual experience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Map className="w-8 h-8 text-blue-500" />}
              title="Interactive Route Planning"
              description="Visualize your entire trip on Google Maps. Add, reorder, and manage stops effortlessly."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-green-500" />}
              title="Smart Daily Itineraries"
              description="Organize your trip day-by-day. Distinguish between travel days and relaxed stay days."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-amber-500" />}
              title="Verified Routes"
              description="Get accurate route previews before you travel. No more surprises on the road."
            />
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Travelers Say</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="mt-4 text-gray-600">Join our community of happy explorers</p>
          </div>

          <div className="relative max-w-5xl mx-auto h-[400px] flex items-center justify-center">
             {/* Navigation Buttons */}
             <button 
                onClick={prevTestimonial}
                className="absolute left-0 md:-left-12 z-20 p-3 bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-600 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110"
             >
                <ChevronLeft className="w-6 h-6" />
             </button>

             <button 
                onClick={nextTestimonial}
                className="absolute right-0 md:-right-12 z-20 p-3 bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-600 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110"
             >
                <ChevronRight className="w-6 h-6" />
             </button>

             {/* Carousel Items */}
             <div className="relative w-full h-full flex items-center justify-center">
                {getVisibleTestimonials().map((item) => (
                   <div 
                      key={item.id}
                      className={cn(
                        "absolute transition-all duration-500 ease-in-out px-4",
                        item.position === 'center' 
                           ? "z-10 opacity-100 scale-100 w-full md:w-[500px]" 
                           : "z-0 opacity-40 scale-90 w-full md:w-[400px] hidden md:block",
                        item.position === 'left' ? "md:-translate-x-[350px]" : "",
                        item.position === 'right' ? "md:translate-x-[350px]" : ""
                      )}
                   >
                      <div className={cn(
                        "bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full justify-between",
                        item.position === 'center' ? "shadow-xl border-amber-100 bg-white ring-1 ring-amber-100" : ""
                      )}>
                          <div className="relative">
                            <div className={cn(
                                "w-20 h-20 rounded-full overflow-hidden border-4 mb-4",
                                item.position === 'center' ? "border-amber-400 shadow-lg" : "border-gray-200"
                            )}>
                               <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex justify-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("w-4 h-4 fill-current", item.position === 'center' ? "text-amber-400" : "text-gray-300")} />
                                ))}
                            </div>
                          </div>
                          
                          <blockquote className={cn("text-gray-600 italic mb-6", item.position === 'center' ? "text-lg text-gray-800" : "text-sm")}>
                            "{item.text}"
                          </blockquote>

                          <div>
                             <h4 className={cn("font-bold text-gray-900", item.position === 'center' ? "text-xl" : "")}>{item.name}</h4>
                             <p className="text-sm text-gray-500">{item.role}</p>
                          </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
             {TESTIMONIALS.map((_, index) => (
               <button 
                  key={index}
                  onClick={() => setTestimonialIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === testimonialIndex ? "w-8 bg-amber-500" : "bg-gray-300 hover:bg-amber-300"
                  )}
               />
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
           <h2 className="text-4xl font-bold mb-6">Ready to start your adventure?</h2>
           <p className="text-gray-400 mb-8 text-lg">Join thousands of travelers planning their dream trips with BeeTravel today.</p>
           <button className="bg-white text-gray-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors">
             Create Free Account
           </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <p>&copy; 2024 BeeTravel Inc. All rights reserved.</p>
           <div className="flex gap-6 text-sm font-medium">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-white transition-colors">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-amber-200 transition-colors group">
    <div className="mb-4 bg-gray-50 w-fit p-3 rounded-lg group-hover:bg-amber-50 transition-colors">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
