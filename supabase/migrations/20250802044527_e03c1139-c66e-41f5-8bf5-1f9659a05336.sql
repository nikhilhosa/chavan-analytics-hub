-- Fix function search path issues by setting proper search path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth, extensions;