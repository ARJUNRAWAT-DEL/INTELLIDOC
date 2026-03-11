import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdZoomIn, MdLocationOn, MdCheckCircle } from 'react-icons/md';

interface LocationFeature {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  activities: string[];
}

const InteractiveExploration = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const locations: LocationFeature[] = [
    {
      id: 0,
      name: 'Research Documents',
      description: 'Explore and analyze academic papers with intelligent summaries',
      icon: <MdLocationOn className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      activities: ['Extract key insights', 'Identify patterns', 'Compare studies', 'Track citations'],
    },
    {
      id: 1,
      name: 'Business Reports',
      description: 'Discover business intelligence and strategic insights instantly',
      icon: <MdLocationOn className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      activities: ['Analyze metrics', 'Extract metrics', 'Compare competitors', 'Forecast trends'],
    },
    {
      id: 2,
      name: 'Legal Documents',
      description: 'Navigate complex legal texts with AI-powered comprehension',
      icon: <MdLocationOn className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      activities: ['Identify clauses', 'Flag risks', 'Compare contracts', 'Extract terms'],
    },
    {
      id: 3,
      name: 'Technical Manuals',
      description: 'Master complex manuals and technical specifications effortlessly',
      icon: <MdLocationOn className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      activities: ['Understand specs', 'Find solutions', 'Track updates', 'Learn features'],
    },
  ];

  const selected = locations[selectedLocation || 0];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-navy-primary/50 to-navy-secondary/30">
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-accent-neon-purple/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-accent-neon-cyan/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 text-accent-neon-purple text-sm font-semibold mb-4">
            Interactive Exploration
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            Zoom In & Discover <span className="text-gradient">Your Document Types</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Click on any location to explore different document types and see how IntelliDoc helps you extract maximum value from each one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Map/Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {locations.map((location, idx) => (
                <motion.button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={`relative p-6 rounded-2xl transition-all duration-300 group cursor-pointer ${
                    selectedLocation === location.id
                      ? `bg-gradient-to-br ${location.color} shadow-2xl`
                      : 'bg-glass-card border border-navy-secondary/30 hover:bg-glass-hover'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-xl ${selectedLocation === location.id ? 'bg-white/20' : 'bg-navy-secondary/40'}`}>
                      {location.icon}
                    </div>
                    <div className={`text-center ${selectedLocation === location.id ? 'text-white' : 'text-text-primary'}`}>
                      <p className="font-semibold text-sm">{location.name}</p>
                    </div>
                  </div>
                  
                  {selectedLocation === location.id && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-white/50"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Zoom hint */}
            <motion.div
              className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-glass-card border border-navy-secondary/30"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MdZoomIn className="w-5 h-5 text-accent-neon-cyan" />
              <p className="text-sm text-text-secondary">Hover or click to zoom into different document types</p>
            </motion.div>
          </motion.div>

          {/* Right: Zoomed Details */}
          <motion.div
            key={selected?.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className={`p-8 rounded-3xl bg-gradient-to-br ${selected.color} relative overflow-hidden group cursor-pointer`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

              <div className="relative z-10">
                {/* Header */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/60 text-sm font-semibold mb-2">Document Type</p>
                      <h3 className="text-3xl font-bold text-white">{selected.name}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isZoomed ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MdZoomIn className="w-8 h-8 text-white/80" />
                    </motion.div>
                  </div>
                  <p className="text-white/80">{selected.description}</p>
                </motion.div>

                {/* Activities List */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <p className="text-white/60 text-sm font-semibold mb-4">What You Can Do</p>
                  {selected.activities.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 text-white/90"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    >
                      <MdCheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{activity}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  className="mt-8 w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  Explore {selected.name}
                </motion.button>
              </div>
            </div>

            {/* Info badge */}
            <motion.div
              className="mt-6 p-4 rounded-xl bg-glass-card border border-navy-secondary/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <p className="text-sm text-text-secondary">
                ✨ Tip: Click on the card to see more details or hover over different document types to explore them instantly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveExploration;
