// Using standard fetch API to avoid UNC path npm install issues with @supabase/supabase-js in WSL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? {
  from: (table: string) => ({
    select: (query: string = '*') => ({
      limit: (count: number) => ({
        single: async () => {
          const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${query}&limit=${count}`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`
            }
          });
          const data = await res.json();
          return { data: data.length > 0 ? data[0] : null };
        }
      })
    }),
    upsert: async (payload: any) => {
      await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    }
  })
} : null;
