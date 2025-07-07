-- Insert or update user record for authenticated users
INSERT INTO public.users (
  auth_user_id,
  account_id,
  name,
  email,
  role,
  confirmed
)
SELECT 
  auth.uid(),
  1, -- Default account_id
  COALESCE(auth.email(), 'Usuário'),
  auth.email(),
  'agent',
  true
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.users WHERE auth_user_id = auth.uid()
)
ON CONFLICT (auth_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();