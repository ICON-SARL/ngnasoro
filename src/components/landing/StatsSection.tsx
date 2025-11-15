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
    <section className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl from-[#0D6A51]/20 to-[#FFAB2E]/20" />
              
              {/* Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Value */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  {stat.value}
                </motion.div>
                
                {/* Label */}
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
