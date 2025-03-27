
import { supabase } from "@/integrations/supabase/client";
import { SfdSubsidy } from "@/types/sfdClients";

// MEREF Subsidy Management API functions
export const subsidyApi = {
  // Get all subsidies for super admins
  async getAllSubsidies() {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .select('*')
        .order('allocated_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as SfdSubsidy[];
    } catch (error) {
      console.error('Error fetching subsidies:', error);
      return [];
    }
  },
  
  // Get all SFDs for the dropdown
  async getAllSfds() {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, code, region')
        .order('name');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      return [];
    }
  },
  
  // Get subsidy by ID
  async getSubsidyById(subsidyId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .select('*')
        .eq('id', subsidyId)
        .single();
        
      if (error) throw error;
      return data as unknown as SfdSubsidy;
    } catch (error) {
      console.error('Error fetching subsidy details:', error);
      return null;
    }
  },
  
  // Get subsidies for a specific SFD
  async getSfdSubsidies(sfdId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('allocated_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as SfdSubsidy[];
    } catch (error) {
      console.error('Error fetching SFD subsidies:', error);
      return [];
    }
  },
  
  // Create new subsidy allocation
  async createSubsidy(subsidy: {
    sfd_id: string;
    amount: number;
    allocated_by: string;
    description?: string;
    end_date?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .insert({
          sfd_id: subsidy.sfd_id,
          amount: subsidy.amount,
          allocated_by: subsidy.allocated_by,
          status: 'active',
          used_amount: 0,
          remaining_amount: subsidy.amount,
          description: subsidy.description,
          end_date: subsidy.end_date
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add activity record
      await supabase
        .from('subsidy_activities')
        .insert({
          subsidy_id: data.id,
          activity_type: 'subsidy_allocated',
          description: `Subvention de ${subsidy.amount} FCFA allouée à la SFD`,
          performed_by: subsidy.allocated_by
        });
        
      return data as unknown as SfdSubsidy;
    } catch (error) {
      console.error('Error creating subsidy:', error);
      throw error;
    }
  },
  
  // Revoke a subsidy
  async revokeSubsidy(subsidyId: string, revokedBy: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .update({
          status: 'revoked'
        })
        .eq('id', subsidyId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add activity record
      await supabase
        .from('subsidy_activities')
        .insert({
          subsidy_id: subsidyId,
          activity_type: 'subsidy_revoked',
          description: reason || 'Subvention révoquée',
          performed_by: revokedBy
        });
        
      return data as unknown as SfdSubsidy;
    } catch (error) {
      console.error('Error revoking subsidy:', error);
      throw error;
    }
  }
};
