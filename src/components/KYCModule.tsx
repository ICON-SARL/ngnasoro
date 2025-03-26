
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Eye, Shield, FileCheck, AlertTriangle, Check } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';

interface VerificationResult {
  status: 'pending' | 'processing' | 'verified' | 'failed';
  confidence?: number;
  message?: string;
  riskScore?: number;
}

const KYCModule = () => {
  const [activeTab, setActiveTab] = useState('id-verification');
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<VerificationResult>({ status: 'pending' });
  const [faceResult, setFaceResult] = useState<VerificationResult>({ status: 'pending' });
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  
  // Voice assistant messages for Bambara localization
  const voiceMessages = {
    idVerification: "Kounben dɔn: I ka taamasiyen yira. I ka i ɲɛnafan wala i koyra kunnafonisɛbɛn yira.",
    selfie: "I ka i ɲɛfoto ta walasa an ka a dɔn ko i yɛrɛ don.",
    processing: "A bɛ i ka fɛnw sɛgɛsɛgɛ. I sabali dɛ...",
    completed: "I ka dantɛmɛsɛbɛn sɛgɛsɛgɛli banna. I ni ce!",
  };

  const handleIdUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (side === 'front') {
          setIdFrontImage(event.target?.result as string);
        } else {
          setIdBackImage(event.target?.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelfieImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startIdVerification = () => {
    if (!idFrontImage || !idBackImage) return;
    
    setOcrResult({ status: 'processing' });
    setProcessingStep(1);
    
    // Simulate OCR processing with Google Vision API
    console.log('Starting ID OCR verification with Google Vision');
    
    // In a real implementation, this would call an API endpoint
    setTimeout(() => {
      setOcrResult({ 
        status: 'verified', 
        confidence: 0.92,
        message: 'ID document verified successfully' 
      });
      setProcessingStep(2);
    }, 3000);
  };

  const startFaceVerification = () => {
    if (!selfieImage || ocrResult.status !== 'verified') return;
    
    setFaceResult({ status: 'processing' });
    setProcessingStep(3);
    
    // Simulate facial verification with AWS Rekognition
    console.log('Starting facial verification with AWS Rekognition');
    
    // In a real implementation, this would call an API endpoint
    setTimeout(() => {
      setFaceResult({ 
        status: 'verified', 
        confidence: 0.89,
        message: 'Facial verification successful' 
      });
      setProcessingStep(4);
      
      // Calculate risk score
      calculateRiskScore();
    }, 3000);
  };

  const calculateRiskScore = () => {
    // Simulate risk scoring algorithm
    console.log('Calculating customer risk score');
    
    // In a real implementation, this would use a more complex algorithm
    setTimeout(() => {
      const score = Math.floor(Math.random() * 15) + 85; // 85-100 range
      setRiskScore(score);
      setProcessingStep(5);
      setKycCompleted(true);
    }, 2000);
  };

  const getRiskClass = () => {
    if (!riskScore) return '';
    if (riskScore >= 90) return 'text-green-600';
    if (riskScore >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          <span className="text-[#FFAB2E]">KYC</span> <span className="text-[#0D6A51]">DANTƐMƐSƐBƐN</span>
        </h1>
        
        {/* Language indicator */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Bambara</span>
          <div className="h-4 w-4 rounded-full bg-[#FFAB2E]"></div>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dantɛmɛsɛbɛn Sɛgɛsɛgɛli</CardTitle>
          <CardDescription>
            Vérification d'identité et évaluation des risques pour KYC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="id-verification" disabled={kycCompleted}>
                <Camera className="h-4 w-4 mr-2" />
                ID
              </TabsTrigger>
              <TabsTrigger 
                value="face-verification" 
                disabled={ocrResult.status !== 'verified' || kycCompleted}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ɲɛfoto
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                disabled={!kycCompleted}
              >
                <Shield className="h-4 w-4 mr-2" />
                Jaabi
              </TabsTrigger>
            </TabsList>
            
            {/* ID Verification Tab */}
            <TabsContent value="id-verification">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Kunnafoni sɛbɛn bila</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Télécharger une photo claire de votre pièce d'identité
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Front */}
                  <div className="space-y-3">
                    <Label htmlFor="id-front">Face avant</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        idFrontImage ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      {idFrontImage ? (
                        <div className="aspect-video relative">
                          <img 
                            src={idFrontImage} 
                            alt="ID Front" 
                            className="object-cover w-full h-full rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Sɛbɛnba ɲɛnafan yira</p>
                        </div>
                      )}
                      <Input
                        id="id-front"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIdUpload('front', e)}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        className="mt-3 w-full"
                        onClick={() => document.getElementById('id-front')?.click()}
                      >
                        Sélectionner
                      </Button>
                    </div>
                  </div>
                  
                  {/* ID Back */}
                  <div className="space-y-3">
                    <Label htmlFor="id-back">Face arrière</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        idBackImage ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      {idBackImage ? (
                        <div className="aspect-video relative">
                          <img 
                            src={idBackImage} 
                            alt="ID Back" 
                            className="object-cover w-full h-full rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Sɛbɛnba kɔfan yira</p>
                        </div>
                      )}
                      <Input
                        id="id-back"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIdUpload('back', e)}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        className="mt-3 w-full"
                        onClick={() => document.getElementById('id-back')?.click()}
                      >
                        Sélectionner
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={startIdVerification}
                    disabled={!idFrontImage || !idBackImage || ocrResult.status === 'processing'}
                  >
                    {ocrResult.status === 'processing' ? (
                      <>Traitement en cours...</>
                    ) : (
                      <>Vérifier document</>
                    )}
                  </Button>
                </div>
                
                {ocrResult.status === 'verified' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Document vérifié</p>
                      <p className="text-sm text-green-600">
                        Confiance: {ocrResult.confidence && (ocrResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Face Verification Tab */}
            <TabsContent value="face-verification">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">I yɛrɛ ɲɛfoto ta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Prenez une photo de votre visage pour vérification
                  </p>
                </div>
                
                <div className="max-w-sm mx-auto">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      selfieImage ? 'border-primary' : 'border-gray-300'
                    }`}
                  >
                    {selfieImage ? (
                      <div className="aspect-square relative">
                        <img 
                          src={selfieImage} 
                          alt="Selfie" 
                          className="object-cover w-full h-full rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Appuyez pour prendre une photo</p>
                      </div>
                    )}
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleSelfieCapture}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="mt-3 w-full"
                      onClick={() => document.getElementById('selfie')?.click()}
                    >
                      Prendre une photo
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={startFaceVerification}
                    disabled={!selfieImage || faceResult.status === 'processing'}
                  >
                    {faceResult.status === 'processing' ? (
                      <>Vérification en cours...</>
                    ) : (
                      <>Vérifier identité</>
                    )}
                  </Button>
                </div>
                
                {faceResult.status === 'verified' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Identité vérifiée</p>
                      <p className="text-sm text-green-600">
                        Correspondance: {faceResult.confidence && (faceResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Results Tab */}
            <TabsContent value="results">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium mb-2">Sɛgɛsɛgɛli Jaabi</h3>
                  <p className="text-sm text-muted-foreground">
                    Résultats de vérification KYC et évaluation des risques
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Verification Results */}
                  <div className="bg-white rounded-lg border p-6 space-y-4">
                    <h4 className="font-medium text-lg flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-primary" />
                      Vérifications
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Document authentique</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Correspondance faciale</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Document non expiré</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Vérification complète</span>
                        <span className="text-green-600">✓</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Score */}
                  <div className="bg-white rounded-lg border p-6 space-y-4">
                    <h4 className="font-medium text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                      Score de risque
                    </h4>
                    
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className={`text-5xl font-bold mb-3 ${getRiskClass()}`}>
                        {riskScore}
                      </div>
                      <Progress 
                        value={riskScore || 0} 
                        className="w-full mb-2"
                      />
                      <div className="w-full flex justify-between text-xs text-muted-foreground">
                        <span>Risque élevé</span>
                        <span>Risque moyen</span>
                        <span>Risque faible</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-center">
                      {riskScore && riskScore >= 90 && (
                        <p className="text-green-600">Ce client présente un risque faible.</p>
                      )}
                      {riskScore && riskScore >= 80 && riskScore < 90 && (
                        <p className="text-amber-600">Ce client présente un risque modéré.</p>
                      )}
                      {riskScore && riskScore < 80 && (
                        <p className="text-red-600">Ce client présente un risque élevé.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <Button>Télécharger rapport KYC</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex-1">
            {processingStep > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progrès</span>
                  <span className="text-sm">{processingStep}/5 étapes</span>
                </div>
                <Progress value={(processingStep / 5) * 100} className="w-full" />
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Voice Assistant for Bambara localization */}
      <VoiceAssistant 
        message={
          activeTab === 'id-verification' 
            ? voiceMessages.idVerification 
            : activeTab === 'face-verification' 
              ? voiceMessages.selfie 
              : kycCompleted 
                ? voiceMessages.completed 
                : voiceMessages.processing
        }
        autoPlay={true}
        language="bambara"
      />
    </div>
  );
};

export default KYCModule;
