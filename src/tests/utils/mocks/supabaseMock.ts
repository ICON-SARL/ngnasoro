
/**
 * Supabase client mock for testing
 */
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { id: 'mock-id' },
          error: null
        }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { id: 'mock-id' },
          error: null
        }))
      })),
      order: jest.fn(() => ({
        range: jest.fn(() => ({
          data: [],
          error: null,
          count: 0
        })),
        data: [],
        error: null
      })),
      or: jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [],
          error: null
        }))
      })),
      group: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  })),
  rpc: jest.fn(() => ({
    data: {},
    error: null
  })),
  functions: {
    invoke: jest.fn(() => ({
      data: {},
      error: null
    }))
  }
};
