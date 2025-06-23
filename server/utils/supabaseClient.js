// server/utils/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and Anon Key must be provided.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;