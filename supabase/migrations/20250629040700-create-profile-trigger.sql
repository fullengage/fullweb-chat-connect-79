
-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table when a new auth user is created
  INSERT INTO public.users (auth_user_id, account_id, name, email, role)
  VALUES (
    NEW.id,
    1, -- Default to first account for demo purposes
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
