
// This file now exports from the new structure
import { useQRCodeGeneration as useQRCodeGenerationInternal } from './mobile-money/useQRCodeGeneration';
import type { QRCodeGenerationHook } from './mobile-money/types';

export const useQRCodeGeneration = useQRCodeGenerationInternal;
export type { QRCodeGenerationHook };
