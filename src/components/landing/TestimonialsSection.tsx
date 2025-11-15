import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Aminata Traoré',
    role: 'Commerçante',
    sfd: 'CVECA Baguinéda',
    content: "Grâce à N'GNA SÔRÔ, j'ai obtenu mon premier prêt en 24h pour agrandir mon commerce. L'application est simple et tout est en bambara !",
    rating: 5,
    avatar: '👩🏿‍💼',
  },
  {
    name: 'Mamadou Coulibaly',
    role: 'Agriculteur',
    sfd: 'Kafo Jiginew',
    content: "Même depuis mon village, je peux épargner et demander des prêts. Plus besoin de voyager des heures pour aller au SFD.",
    rating: 5,
    avatar: '👨🏿‍🌾',
  },
  {
    name: 'Fatoumata Diarra',
    role: 'Artisane',
    sfd: 'BNDA',
    content: "Le coffre collaboratif m'a aidé à réaliser mon projet avec mes amies. On épargne ensemble, c'est motivant !",
    rating: 5,
    avatar: '👩🏿',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des milliers de Maliens utilisent N'GNA SÔRÔ au quotidien
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FFAB2E] rounded-full flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Card */}
              <div className="relative bg-slate-50 rounded-3xl p-8 h-full border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#FFAB2E] text-[#FFAB2E]" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-[#0D6A51] font-medium mt-1">
                      {testimonial.sfd}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
