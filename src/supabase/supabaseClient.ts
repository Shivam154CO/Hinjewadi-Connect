import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kazpzlhqchzexhpojrgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthenB6bGhxY2h6ZXhocG9qcmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTczOTcsImV4cCI6MjA4NzI3MzM5N30.OkB0Jk8dPwV63o6rHG5CYPZ5w3MRu7IvPj9MunXlF-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
