
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';

const TestimonialCard = ({ content, author, role, image }: { content: string, author: string, role: string, image: string }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex gap-1 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <StarIcon key={i} className="h-5 w-5 fill-[#FFAB2E] text-[#FFAB2E]" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">"{content}"</p>
      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={author}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold">{author}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "Grâce à N'GNA SÔRÔ!, j'ai pu obtenir un microcrédit pour développer mon commerce de fruits et légumes à Bamako. Le processus était très simple et rapide!",
      author: "Aminata Diallo",
      role: "Commerçante à Bamako",
      image: "/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png"
    },
    {
      content: "En tant que SFD, cette plateforme nous permet de toucher plus de clients dans les zones rurales et d'offrir nos services à moindre coût.",
      author: "Ibrahim Touré",
      role: "Directeur SFD Nyèsigiso",
      image: "/lovable-uploads/2b4e263e-7201-487a-a83d-f4c8ae811a48.png"
    },
    {
      content: "Je peux maintenant gérer mes comptes dans différentes SFDs avec une seule application. Le transfert d'argent vers ma famille en région est devenu si facile!",
      author: "Fatoumata Koné",
      role: "Enseignante à Ségou",
      image: "/lovable-uploads/ef525c3f-3c63-46c2-a852-9c93524d29df.png"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-[#FFAB2E]/10 text-[#FFAB2E] border-[#FFAB2E]/20">
            Témoignages
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez comment N'GNA SÔRÔ! transforme l'accès aux services financiers à travers le Mali.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              role={testimonial.role}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
