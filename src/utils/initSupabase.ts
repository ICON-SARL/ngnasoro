
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  // Mock implementation for now
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        })
      }),
      insert: () => ({
        data: [],
        error: null
      }),
      update: () => ({
        data: [],
        error: null
      }),
      delete: () => ({
        data: [],
        error: null
      })
    })
  } as any;
};
