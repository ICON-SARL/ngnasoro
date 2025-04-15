
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t py-4 md:py-4 bg-white">
      <div className="container px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} MEREF. Tous droits réservés.
        </p>
        <div className="flex gap-3 text-xs md:text-sm text-muted-foreground">
          <a href="#" className="hover:underline">Confidentialité</a>
          <a href="#" className="hover:underline">Termes</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
