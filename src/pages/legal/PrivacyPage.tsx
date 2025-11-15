import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Politique de Confidentialité
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
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le Ministère de l'Économie et des Finances (MEREF) s'engage à
                  protéger la vie privée des utilisateurs de N'GNA SÔRÔ. Cette
                  politique décrit comment nous collectons, utilisons et protégeons
                  vos données personnelles.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Données Collectées
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Données d'identification :</strong> Nom, prénom, date de
                    naissance, pièce d'identité
                  </li>
                  <li>
                    <strong>Coordonnées :</strong> Email, numéro de téléphone, adresse
                  </li>
                  <li>
                    <strong>Données financières :</strong> Historique de transactions,
                    soldes de comptes, historique de prêts
                  </li>
                  <li>
                    <strong>Données techniques :</strong> Adresse IP, type d'appareil,
                    système d'exploitation
                  </li>
                  <li>
                    <strong>Documents KYC :</strong> Justificatifs d'identité, de
                    domicile, de revenus
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Utilisation des Données
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Créer et gérer votre compte</li>
                  <li>Traiter vos demandes de prêt et transactions</li>
                  <li>Vérifier votre identité (procédure KYC)</li>
                  <li>Améliorer nos services</li>
                  <li>Vous envoyer des notifications importantes</li>
                  <li>Prévenir la fraude et assurer la sécurité</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Partage des Données
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Les SFD partenaires :</strong> Pour traiter vos demandes
                    d'adhésion et de prêt
                  </li>
                  <li>
                    <strong>Les opérateurs Mobile Money :</strong> Pour effectuer les
                    transactions
                  </li>
                  <li>
                    <strong>Les autorités compétentes :</strong> En cas d'obligation
                    légale
                  </li>
                  <li>
                    <strong>Les prestataires techniques :</strong> Pour l'hébergement
                    et la maintenance (sous accord de confidentialité strict)
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Sécurité des Données
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nous mettons en œuvre des mesures de sécurité robustes :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>Authentification à deux facteurs (2FA)</li>
                  <li>Stockage sécurisé des données sensibles</li>
                  <li>Audits de sécurité réguliers</li>
                  <li>Formation du personnel sur la protection des données</li>
                  <li>Contrôles d'accès stricts</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Vos Droits
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Conformément à la loi malienne, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Droit d'accès :</strong> Consulter vos données personnelles
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> Corriger vos données
                    inexactes
                  </li>
                  <li>
                    <strong>Droit à l'effacement :</strong> Demander la suppression de
                    vos données (sous conditions)
                  </li>
                  <li>
                    <strong>Droit d'opposition :</strong> Vous opposer à certains
                    traitements
                  </li>
                  <li>
                    <strong>Droit à la portabilité :</strong> Recevoir vos données dans
                    un format structuré
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Pour exercer ces droits, contactez-nous à{' '}
                  <a
                    href="mailto:privacy@ngnasoro.ml"
                    className="text-[#0D6A51] hover:underline"
                  >
                    privacy@ngnasoro.ml
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Conservation des Données
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Vos données sont conservées pendant la durée nécessaire aux
                  finalités pour lesquelles elles ont été collectées, plus les délais
                  légaux de conservation (généralement 5 ans après la fermeture du
                  compte pour les données financières).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Cookies et Technologies Similaires
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  N'GNA SÔRÔ utilise des cookies strictement nécessaires au
                  fonctionnement de la plateforme (authentification, sécurité). Aucun
                  cookie de tracking publicitaire n'est utilisé.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Modifications de la Politique
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous pouvons modifier cette politique de confidentialité. Les
                  modifications importantes seront notifiées via l'application et par
                  email.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Contact
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant cette politique ou vos données
                  personnelles :
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700">
                    <strong>Email :</strong>{' '}
                    <a
                      href="mailto:privacy@ngnasoro.ml"
                      className="text-[#0D6A51] hover:underline"
                    >
                      privacy@ngnasoro.ml
                    </a>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>Adresse :</strong> Ministère de l'Économie et des
                    Finances, Bamako, Mali
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <p className="text-gray-600 text-sm">
                  Cette politique de confidentialité est conforme à la législation
                  malienne en matière de protection des données personnelles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
