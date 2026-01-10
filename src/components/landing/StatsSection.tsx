import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Star } from 'lucide-react';

const stats = [
  { icon: Building2, value: '12+', label: 'SFD Partenaires', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Users, value: '50K+', label: 'Clients Actifs', gradient: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, value: '2.5Mds', label: 'FCFA Décaissés', gradient: 'from-orange-500 to-red-500' },
  { icon: Star, value: '95%', label: 'Satisfaction', gradient: 'from-green-500 to-emerald-500' },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative group cursor-default"
            >
              {/* Subtle colored background on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              {/* Card - Solid white, soft shadow */}
              <div className="relative bg-white rounded-3xl p-6 sm:p-8 
                            border border-border/40 group-hover:border-primary/15
                            shadow-soft-sm group-hover:shadow-soft-md
                            transition-all duration-400 ease-premium">
                
                {/* Icon with subtle animation */}
                <motion.div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} 
                             flex items-center justify-center mb-4 shadow-soft-md
                             group-hover:shadow-soft-lg transition-shadow duration-400`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
                
                {/* Value with improved typography */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1 + 0.2, 
                    type: 'spring', 
                    stiffness: 300,
                    damping: 20
                  }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 tracking-tight"
                >
                  {stat.value}
                </motion.div>
                
                {/* Label with better contrast */}
                <p className="text-sm sm:text-base text-gray-600 font-semibold">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
