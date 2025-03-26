
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Volume2, VolumeX } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSelector = () => {
  const { language, setLanguage, voiceOverEnabled, toggleVoiceOver } = useLocalization();

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleVoiceOver}
        className="relative text-muted-foreground hover:text-foreground"
      >
        {voiceOverEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLanguage('french')} className={language === 'french' ? 'bg-muted' : ''}>
            <span className="mr-2">🇫🇷</span> Français
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage('bambara')} className={language === 'bambara' ? 'bg-muted' : ''}>
            <span className="mr-2">🇲🇱</span> Bambara
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
