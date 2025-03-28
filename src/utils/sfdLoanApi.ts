
// This file is now a facade that re-exports the refactored services
// to maintain backward compatibility
import { sfdLoanApi } from "@/services/loans";

// Export everything from the new modular API
export { sfdLoanApi };
