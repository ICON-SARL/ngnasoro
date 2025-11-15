import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const partners = [
  'BNDA', 'Kafo Jiginew', 'Nyèsigiso', 'CVECA Baguinéda',
  'Jemeni', 'FECECAM', 'UACB', 'Soro Yiriwaso',
  'Yèrèwolo', 'Kondo Jigima', 'Djiguiya SO', 'Papaye'
];

const SfdPartnersSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#0D6A51]/10 rounded-full px-6 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-[#0D6A51]" />
            <span className="text-[#0D6A51] font-semibold">Agréé MEREF</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nos Partenaires SFD
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plus de 12 Structures de Financement Décentralisé à votre service
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl p-6 h-28 flex flex-col items-center justify-center text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Icon */}
                <Building2 className="w-8 h-8 text-gray-400 group-hover:text-[#0D6A51] mb-2 transition-colors" />
                
                {/* Name */}
                <p className="font-semibold text-gray-900 group-hover:text-[#0D6A51] transition-colors text-sm">
                  {partner}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Votre SFD n'est pas dans la liste ?
          </p>
          <Badge variant="outline" className="px-6 py-3 text-sm cursor-pointer hover:bg-gray-50">
            Contactez-nous pour devenir partenaire
          </Badge>
        </motion.div>
      </div>
    </section>
  );
};

export default SfdPartnersSection;
