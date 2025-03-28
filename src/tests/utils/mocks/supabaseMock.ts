
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
        data: [],
        error: null
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'mock-id' },
            error: null
          }))
        }))
      }))
    }))
  }),
  functions: {
    invoke: jest.fn(() => ({
      data: {},
      error: null
    }))
  }
};
