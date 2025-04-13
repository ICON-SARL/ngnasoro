
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useToast } from '@/hooks/use-toast';

const LoanApplicationPage: React.FC = () => {
  const { applyForLoan, isUploading, uploadDocument } = useClientLoans();
  const { activeSfdId } = useSfdDataAccess();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanDuration, setLoanDuration] = useState<number>(6);
  const [loanPurpose, setLoanPurpose] = useState<string>("");
  const [purposeCategory, setPurposeCategory] = useState<string>("");
  const [supportingDocs, setSupportingDocs] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Format number with thousands separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  // Calculate monthly payment (simple formula)
  const calculateMonthlyPayment = () => {
    const interestRate = 0.055 / 12; // 5.5% annual rate divided by 12 months
    const monthlyPayment = (loanAmount * interestRate * Math.pow(1 + interestRate, loanDuration)) / 
                          (Math.pow(1 + interestRate, loanDuration) - 1);
    return Math.round(monthlyPayment);
  };
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCurrentFile(file);
    setUploadProgress(0);
    
    try {
      // Upload progress simulation
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const fileUrl = await uploadDocument(file);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (fileUrl) {
        setSupportingDocs(prev => [...prev, fileUrl]);
        setCurrentFile(null);
        
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error("L'envoi du fichier a échoué");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur",
        description: "Le téléchargement du document a échoué",
        variant: "destructive",
      });
      setCurrentFile(null);
      setUploadProgress(0);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Aucune SFD sélectionnée",
        variant: "destructive",
      });
      return;
    }
    
    if (!loanPurpose || loanPurpose.trim().length < 10) {
      toast({
        title: "Information requise",
        description: "Veuillez décrire l'objet du prêt (au moins 10 caractères)",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await applyForLoan.mutateAsync({
        sfd_id: activeSfdId,
        amount: loanAmount,
        duration_months: loanDuration,
        purpose: `${purposeCategory}: ${loanPurpose}`,
        supporting_documents: supportingDocs
      });
      
      navigate('/mobile-flow/my-loans');
    } catch (error) {
      console.error("Loan application error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#0D6A51] to-[#064032] text-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white" 
          onClick={() => navigate('/mobile-flow/my-loans')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Faire une demande de prêt</h1>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Montant et durée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount">Montant du prêt</Label>
                  <span className="font-medium text-[#0D6A51]">{formatNumber(loanAmount)} FCFA</span>
                </div>
                <Slider
                  id="amount"
                  min={10000}
                  max={1000000}
                  step={10000}
                  value={[loanAmount]}
                  onValueChange={values => setLoanAmount(values[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 000 FCFA</span>
                  <span>1 000 000 FCFA</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <Label htmlFor="duration">Durée du prêt</Label>
                  <span className="font-medium text-[#0D6A51]">{loanDuration} mois</span>
                </div>
                <Slider
                  id="duration"
                  min={1}
                  max={24}
                  step={1}
                  value={[loanDuration]}
                  onValueChange={values => setLoanDuration(values[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 mois</span>
                  <span>24 mois</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mensualité estimée:</span>
                  <span className="font-semibold">{formatNumber(calculateMonthlyPayment())} FCFA</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Taux d'intérêt:</span>
                  <span className="font-semibold">5,5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Objet du prêt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose-category">Catégorie</Label>
                <Select value={purposeCategory} onValueChange={setPurposeCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                    <SelectItem value="sante">Santé</SelectItem>
                    <SelectItem value="habitat">Habitat</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Description détaillée</Label>
                <Textarea 
                  id="purpose" 
                  placeholder="Décrivez en détail l'objet de votre demande de prêt" 
                  rows={4}
                  value={loanPurpose}
                  onChange={e => setLoanPurpose(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Documents justificatifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isUploading || !!currentFile}
                />
                
                {!currentFile ? (
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium mb-1">Ajouter un document</p>
                      <p className="text-xs text-gray-500">PDF, JPG ou PNG (max. 5MB)</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-[#0D6A51] mb-2 animate-spin" />
                    <p className="text-sm font-medium mb-1">{currentFile.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-[#0D6A51] h-2 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {supportingDocs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Documents téléchargés ({supportingDocs.length})</h4>
                  <ul className="space-y-2">
                    {supportingDocs.map((doc, index) => (
                      <li key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex items-center">
                        <div className="h-6 w-6 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mr-2">
                          <FileText className="h-3 w-3 text-[#0D6A51]" />
                        </div>
                        Document {index + 1}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="sticky bottom-20 bg-white p-4 border-t border-gray-200 mt-auto">
            <Button 
              type="submit" 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 p-6 rounded-xl font-medium"
              disabled={isSubmitting || !purposeCategory || !loanPurpose}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Soumettre ma demande
            </Button>
          </div>
        </form>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default LoanApplicationPage;
