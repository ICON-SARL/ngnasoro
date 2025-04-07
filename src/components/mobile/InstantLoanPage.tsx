import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, AlertCircle, Check, Clock, Landmark } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function InstantLoanPage() {
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanDuration, setLoanDuration] = useState(6);
  const [loanPurpose, setLoanPurpose] = useState("personal");
  const [applicationProgress, setApplicationProgress] = useState(25);

  const handleApplyLoan = () => {
    toast({
      title: "Demande soumise!",
      description: "Votre demande de prêt instantané a été soumise avec succès.",
    });
  };

  return (
    <div className="container py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Prêt Instantané</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant du prêt (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durée (mois)</Label>
            <Slider
              id="duration"
              defaultValue={[loanDuration]}
              max={24}
              min={3}
              step={1}
              onValueChange={(value) => setLoanDuration(value[0])}
            />
            <p className="text-sm text-muted-foreground">
              {loanDuration} mois
            </p>
          </div>
          <div className="space-y-2">
            <Label>Motif du prêt</Label>
            <RadioGroup defaultValue={loanPurpose} onValueChange={setLoanPurpose}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="r1" />
                <Label htmlFor="r1">Personnel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="r2" />
                <Label htmlFor="r2">Professionnel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="r3" />
                <Label htmlFor="r3">Urgence</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Progression de la demande</Label>
            <Progress value={applicationProgress} className="h-1.5" />
            <div className="mt-2 text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Estimation: 24 heures
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleApplyLoan}>
            Appliquer maintenant <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-4 text-sm text-muted-foreground text-center">
        <AlertCircle className="inline-block h-4 w-4 mr-1 align-middle" />{" "}
        Crédit vous engage et doit être remboursé. Vérifiez votre capacité de
        remboursement avant de vous engager.
      </div>
    </div>
  );
}
