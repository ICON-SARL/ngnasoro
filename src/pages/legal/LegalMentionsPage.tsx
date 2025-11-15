import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LegalMentionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Mentions Légales</h1>
              <p className="text-white/90">
                Informations légales et réglementaires
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Éditeur de la Plateforme
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <p className="text-gray-700">
                    <strong>Raison sociale :</strong> Ministère de l'Économie et des
                    Finances de la République du Mali (MEREF)
                  </p>
                  <p className="text-gray-700">
                    <strong>Siège social :</strong> Bamako, République du Mali
                  </p>
                  <p className="text-gray-700">
                    <strong>Directeur de publication :</strong> Ministre de l'Économie
                    et des Finances
                  </p>
                  <p className="text-gray-700">
                    <strong>Email :</strong>{' '}
                    <a
                      href="mailto:contact@ngnasoro.ml"
                      className="text-[#0D6A51] hover:underline"
                    >
                      contact@ngnasoro.ml
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Téléphone :</strong> +223 20 XX XX XX
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Hébergement
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <p className="text-gray-700">
                    <strong>Hébergeur :</strong> Lovable Cloud (Supabase)
                  </p>
                  <p className="text-gray-700">
                    <strong>Type :</strong> Infrastructure cloud sécurisée
                  </p>
                  <p className="text-gray-700">
                    <strong>Localisation :</strong> Centres de données certifiés ISO
                    27001
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Objet de la Plateforme
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  N'GNA SÔRÔ est une plateforme gouvernementale développée par le
                  MEREF dans le cadre de sa politique d'inclusion financière. Elle
                  vise à faciliter l'accès des citoyens maliens aux services de
                  microfinance proposés par les Structures Financières Décentralisées
                  (SFD) agréées.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Propriété Intellectuelle
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  L'ensemble des éléments de la plateforme N'GNA SÔRÔ (structure,
                  design, textes, images, logos, graphismes, icônes, sons, logiciels)
                  est la propriété exclusive du MEREF, à l'exception :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Des logos des SFD partenaires (propriété de leurs titulaires)</li>
                  <li>Des contenus soumis par les utilisateurs</li>
                  <li>
                    Des bibliothèques open-source utilisées (sous leurs licences
                    respectives)
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Toute reproduction, représentation, modification, publication,
                  adaptation de tout ou partie des éléments de la plateforme, quel que
                  soit le moyen ou le procédé utilisé, est interdite, sauf
                  autorisation écrite préalable du MEREF.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Protection des Données Personnelles
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le MEREF s'engage à respecter la législation malienne en vigueur en
                  matière de protection des données personnelles. Pour plus
                  d'informations, consultez notre{' '}
                  <button
                    onClick={() => navigate('/legal/privacy')}
                    className="text-[#0D6A51] hover:underline font-medium"
                  >
                    Politique de Confidentialité
                  </button>
                  .
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Responsabilité
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Le MEREF s'efforce d'assurer l'exactitude et la mise à jour des
                  informations diffusées sur N'GNA SÔRÔ. Cependant :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Le MEREF ne peut être tenu responsable des erreurs, d'une absence
                    de disponibilité des informations et/ou de la présence de virus
                    sur la plateforme
                  </li>
                  <li>
                    Les décisions de prêt, taux d'intérêt et conditions relèvent de la
                    responsabilité exclusive des SFD partenaires
                  </li>
                  <li>
                    Le MEREF ne peut être tenu responsable des dysfonctionnements des
                    services de Mobile Money des opérateurs
                  </li>
                  <li>
                    L'utilisateur est seul responsable de la sécurité de ses
                    identifiants de connexion
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Liens Hypertextes
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  N'GNA SÔRÔ peut contenir des liens vers des sites externes (sites
                  des SFD partenaires, opérateurs Mobile Money). Le MEREF n'exerce
                  aucun contrôle sur ces sites et décline toute responsabilité quant à
                  leur contenu.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Accessibilité
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le MEREF s'engage à rendre N'GNA SÔRÔ accessible au plus grand
                  nombre, conformément aux standards internationaux d'accessibilité
                  web (WCAG 2.1). Si vous rencontrez des difficultés d'accès,
                  contactez-nous à{' '}
                  <a
                    href="mailto:accessibilite@ngnasoro.ml"
                    className="text-[#0D6A51] hover:underline"
                  >
                    accessibilite@ngnasoro.ml
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Droit Applicable et Juridiction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes mentions légales sont régies par le droit de la
                  République du Mali. En cas de litige, et après échec de toute
                  tentative de recherche d'une solution amiable, les tribunaux de
                  Bamako seront seuls compétents.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Agrément MEREF
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Toutes les SFD partenaires listées sur N'GNA SÔRÔ sont agréées par
                  le Ministère de l'Économie et des Finances conformément à la
                  réglementation malienne en vigueur sur les institutions de
                  microfinance.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <p className="text-gray-600 text-sm">
                  Dernière mise à jour : Janvier 2025
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Pour toute question relative aux présentes mentions légales,
                  contactez-nous à{' '}
                  <a
                    href="mailto:legal@ngnasoro.ml"
                    className="text-[#0D6A51] hover:underline"
                  >
                    legal@ngnasoro.ml
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalMentionsPage;
