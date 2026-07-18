import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lwkdudqnbwxlnmkudpq.supabase.co";
const SUPABASE_KEY = "Sb_publishable_GFMh9Pa3nHXmCojo1AWZzA_BRLTTRQs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: any, res: any) {
  // GET REQUEST: Fetch data
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('markets').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST REQUEST: Add data
  if (req.method === 'POST') {
    const { data, error } = await supabase.from('markets').insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // PUT REQUEST: Update data
  if (req.method === 'PUT') {
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from('markets').update(updateData).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
