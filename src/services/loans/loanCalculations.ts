
interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
}

export const calculateLoanDetails = (
  amount: number, 
  durationMonths: number, 
  interestRate: number
): LoanCalculationResult => {
  // Convert annual interest rate to monthly
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment using standard amortization formula
  const monthlyPayment = amount * 
    (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
    (Math.pow(1 + monthlyRate, durationMonths) - 1);
  
  // Calculate total repayment and total interest
  const totalRepayment = monthlyPayment * durationMonths;
  const totalInterest = totalRepayment - amount;

  return {
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2))
  };
};
