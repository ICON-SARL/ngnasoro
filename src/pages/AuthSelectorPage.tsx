import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Building2 } from 'lucide-react';

const AuthSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      type: 'client',
      title: 'Espace Client',
      description: 'Accédez à votre compte et gérez vos finances',
      icon: User,
      color: 'from-primary to-accent',
      path: '/auth',
    },
    {
      type: 'admin',
      title: 'Espace Admin',
      description: 'Supervision et gestion du système MEREF',
      icon: Shield,
      color: 'from-warning to-amber-600',
      path: '/admin/auth',
    },
    {
      type: 'sfd',
      title: 'Espace SFD',
      description: 'Gestion de votre structure de microfinance',
      icon: Building2,
      color: 'from-info to-blue-600',
      path: '/sfd/auth',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Logo and header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <img 
              src="/lovable-uploads/LOGO_transprant_1763143001713.png" 
              alt="N'GNA SÔRÔ Logo" 
              className="h-24 mx-auto drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold mb-3 gradient-text">N'GNA SÔRÔ</h1>
          <p className="text-muted-foreground text-lg">Sélectionnez votre espace</p>
        </motion.div>

        {/* User type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;
            return (
              <motion.div
                key={userType.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className="group cursor-pointer"
                onClick={() => navigate(userType.path)}
              >
                <div className="glass-card p-8 h-full hover:shadow-2xl smooth-transition border-2 border-border/50 hover:border-primary/50">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${userType.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 smooth-transition`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title and description */}
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary smooth-transition">
                    {userType.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {userType.description}
                  </p>

                  {/* Action button */}
                  <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${userType.color} bg-clip-text text-transparent group-hover:translate-x-2 smooth-transition`}>
                    Accéder
                    <svg 
                      className="w-4 h-4 ml-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-muted-foreground text-sm mt-12"
        >
          Plateforme sécurisée de microfinance | N'GNA SÔRÔ © 2024
        </motion.p>
      </div>
    </div>
  );
};

export default AuthSelectorPage;
