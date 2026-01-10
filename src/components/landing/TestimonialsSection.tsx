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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              {/* Quote icon - softer */}
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-accent/80 rounded-full flex items-center justify-center shadow-soft-md opacity-80 group-hover:opacity-100 transition-opacity duration-400">
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Card */}
              <div className="relative bg-card rounded-3xl p-8 h-full border border-border/40 shadow-soft-sm hover:shadow-soft-md transition-all duration-400 ease-premium">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-5 border-t border-border/40">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">
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
