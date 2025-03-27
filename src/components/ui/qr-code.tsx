
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export function QRCode({ value, size = 200, level = 'M' }: QRCodeProps) {
  // Note: This is a simple wrapper around an image that would be generated server-side
  // In a real implementation, this would either use a QR code library or display a pre-generated QR code
  return (
    <div className="bg-white p-2 rounded">
      <img 
        src={value} 
        alt="QR Code" 
        width={size} 
        height={size} 
        className="qr-code"
      />
    </div>
  );
}
