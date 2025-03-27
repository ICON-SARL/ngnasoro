
import React from 'react';
import { Button } from '@/components/ui/button';

const SocialButtons = () => {
  return (
    <>
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Ou</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button">Google</Button>
        <Button variant="outline" type="button">Facebook</Button>
      </div>
    </>
  );
};

export default SocialButtons;
