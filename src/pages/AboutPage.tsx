import { Users, Target, Heart } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-blue-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">We Make Travel Simple</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            TravelBee was born from a simple idea: Planning a trip should be as enjoyable as the trip itself.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To empower travelers with intuitive tools that turn dream destinations into actionable itineraries.
            </p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
            <p className="text-gray-600">
              We believe in the power of shared experiences. Our platform is built on real insights from real travelers.
            </p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Passion for Travel</h3>
            <p className="text-gray-600">
              We are a team of explorers, bringing our love for adventure into every feature we build.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section Mock */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet the Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 w-full" />
                <div className="p-4 text-center">
                  <h4 className="font-bold text-gray-900">Team Member {i}</h4>
                  <p className="text-sm text-blue-600">Role Title</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
