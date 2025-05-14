
import { supabase } from "@/integrations/supabase/client";

export const setupLoanRealtimeSubscription = (callback: (payload: any) => void) => {
  console.log("Setting up loan realtime subscription for all loans");

  const channel = supabase
    .channel("loan-updates")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "sfd_loans",
      },
      (payload) => {
        console.log("Loan update received:", payload);
        callback(payload.new || payload.old);
      }
    )
    .subscribe((status) => {
      console.log("Loan subscription status:", status);
    });

  // Return cleanup function
  return () => {
    console.log("Cleaning up loan realtime subscription");
    supabase.removeChannel(channel);
  };
};

export const setupClientLoanSubscription = (clientId: string, callback: (payload: any) => void) => {
  if (!clientId) return () => {};
  
  console.log(`Setting up loan subscription for client: ${clientId}`);
  
  const channel = supabase
    .channel(`client-loans-${clientId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sfd_loans",
        filter: `client_id=eq.${clientId}`,
      },
      (payload) => {
        console.log("Client loan update received:", payload);
        callback(payload.new || payload.old);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
