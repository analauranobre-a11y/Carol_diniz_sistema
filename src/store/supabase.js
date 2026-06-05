import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bjrqbyuhwjsaozfknkam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcnFieXVod2pzYW96Zmtua2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTQ3NTYsImV4cCI6MjA5NjE5MDc1Nn0.SQZ9dV5OlI7qxFyZ3NHKdLvu1xT7tpP6_2NbrrPmoM4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
