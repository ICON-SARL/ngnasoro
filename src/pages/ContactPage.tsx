import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'Message envoyé !',
      description: 'Nous vous répondrons dans les plus brefs délais.',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@ngnasoro.ml',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+223 20 XX XX XX',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Bamako, Mali',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <Building2 className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-white/90">
              Une question ? Une suggestion ? Notre équipe MEREF est à votre écoute
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Restons en contact
                </h2>
                <p className="text-gray-600 text-lg">
                  Nous sommes là pour répondre à toutes vos questions sur N'GNA SÔRÔ
                  et nos services de microfinance.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center shadow-lg`}
                          >
                            <info.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {info.label}
                            </p>
                            <p className="font-semibold text-gray-900 text-lg">
                              {info.value}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* MEREF Info */}
              <Card className="bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">
                    Ministère de l'Économie et des Finances
                  </h3>
                  <p className="text-white/90 text-sm">
                    N'GNA SÔRÔ est une initiative du MEREF pour promouvoir
                    l'inclusion financière au Mali et soutenir le développement
                    économique des populations.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-gray-200 shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Envoyez-nous un message
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Votre nom"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="votre@email.com"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+223 XX XX XX XX"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet
                      </label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="Sujet de votre message"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Votre message..."
                        rows={6}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-[#0D6A51] hover:bg-[#176455] text-white font-semibold"
                    >
                      {isSubmitting ? (
                        'Envoi en cours...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
