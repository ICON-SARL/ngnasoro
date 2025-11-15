import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CGUPage: React.FC = () => {
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
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-white/90">
                Dernière mise à jour : Janvier 2025
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
                  1. Objet
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent
                  l'utilisation de la plateforme N'GNA SÔRÔ, développée par le Ministère
                  de l'Économie et des Finances de la République du Mali (MEREF) pour
                  faciliter l'accès aux services de microfinance.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Acceptation des CGU
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  En utilisant N'GNA SÔRÔ, vous acceptez pleinement et sans réserve
                  les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez
                  ne pas utiliser la plateforme.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Inscription et Compte Utilisateur
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Pour utiliser N'GNA SÔRÔ, vous devez :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Avoir au moins 18 ans</li>
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Choisir une Structure Financière Décentralisée (SFD) agréée</li>
                  <li>Conserver la confidentialité de vos identifiants</li>
                  <li>Notifier immédiatement tout usage non autorisé de votre compte</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Services Offerts
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  N'GNA SÔRÔ facilite l'accès aux services suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Gestion de comptes multi-SFD</li>
                  <li>Demandes de microcrédits</li>
                  <li>Épargne individuelle et collaborative (coffres)</li>
                  <li>Transactions via Mobile Money</li>
                  <li>Consultation de l'historique financier</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Obligations de l'Utilisateur
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vous vous engagez à :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Utiliser la plateforme de manière légale et conforme</li>
                  <li>Ne pas tenter de contourner les mesures de sécurité</li>
                  <li>Ne pas utiliser de compte sous une fausse identité</li>
                  <li>Respecter les échéances de remboursement des prêts</li>
                  <li>Maintenir vos informations KYC à jour</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Responsabilité
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le MEREF s'efforce d'assurer la disponibilité et la sécurité de
                  N'GNA SÔRÔ mais ne peut garantir un accès ininterrompu. Les
                  décisions de prêt relèvent de la responsabilité exclusive des SFD
                  partenaires.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Propriété Intellectuelle
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Tous les éléments de N'GNA SÔRÔ (logo, nom, interface, contenus)
                  sont la propriété du MEREF et sont protégés par les lois en
                  vigueur. Toute reproduction est interdite sans autorisation.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Modification des CGU
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le MEREF se réserve le droit de modifier les présentes CGU à tout
                  moment. Les utilisateurs seront informés des modifications
                  importantes par notification dans l'application.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Résiliation
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Vous pouvez fermer votre compte à tout moment. Le MEREF et les SFD
                  peuvent suspendre ou fermer un compte en cas de violation des CGU
                  ou d'activité suspecte.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Droit Applicable et Juridiction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes CGU sont régies par le droit malien. Tout litige
                  sera soumis à la compétence exclusive des tribunaux de Bamako,
                  Mali.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <p className="text-gray-600 text-sm">
                  Pour toute question concernant ces CGU, contactez-nous à{' '}
                  <a
                    href="mailto:contact@ngnasoro.ml"
                    className="text-[#0D6A51] hover:underline"
                  >
                    contact@ngnasoro.ml
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

export default CGUPage;
