
-- Create function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create plans table first (referenced by accounts)
CREATE TABLE public.plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  max_users INTEGER DEFAULT 0,
  max_conversations INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table
CREATE TABLE public.accounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  cnpj TEXT,
  city TEXT,
  state TEXT,
  industry TEXT,
  description TEXT,
  plan_id INTEGER REFERENCES public.plans(id),
  is_active BOOLEAN DEFAULT true,
  current_users INTEGER DEFAULT 0,
  current_conversations INTEGER DEFAULT 0,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (for user profiles)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('superadmin', 'admin', 'agent')),
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_user_id)
);

-- Create contacts table
CREATE TABLE public.contacts (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'pending', 'snoozed')),
  assignee_id UUID REFERENCES public.users(id),
  kanban_stage TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_reply_created_at TIMESTAMP WITH TIME ZONE,
  waiting_since TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  additional_attributes JSONB DEFAULT '{}',
  custom_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'system')),
  sender_id TEXT,
  content TEXT,
  attachments JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table (as provided)
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('agent', 'supervisor', 'administrator')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  teams TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_stats table
CREATE TABLE public.agent_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  conversations_today INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER DEFAULT 0,
  resolution_rate DECIMAL(5,2) DEFAULT 0.00,
  rating DECIMAL(3,2) DEFAULT 0.00,
  attendances INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get current user account
CREATE OR REPLACE FUNCTION public.get_current_user_account()
RETURNS INTEGER AS $$
  SELECT account_id FROM public.users WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for plans table
CREATE POLICY "Superadmin can manage all plans" ON public.plans FOR ALL USING (public.get_current_user_role() = 'superadmin');
CREATE POLICY "Users can view plans" ON public.plans FOR SELECT USING (true);

-- RLS Policies for accounts table
CREATE POLICY "Superadmin can manage all accounts" ON public.accounts FOR ALL USING (public.get_current_user_role() = 'superadmin');
CREATE POLICY "Users can view their account" ON public.accounts FOR SELECT USING (id = public.get_current_user_account());

-- RLS Policies for users table
CREATE POLICY "Users can view users from their account" ON public.users FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can manage users in their account" ON public.users FOR ALL USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);

-- RLS Policies for contacts table
CREATE POLICY "Users can view contacts from their account" ON public.contacts FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Users can manage contacts in their account" ON public.contacts FOR ALL USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);

-- RLS Policies for conversations table
CREATE POLICY "Users can view conversations from their account" ON public.conversations FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Users can manage conversations in their account" ON public.conversations FOR ALL USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages from their account conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin')
  )
);
CREATE POLICY "Users can manage messages in their account conversations" ON public.messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin')
  )
);

-- RLS Policies for agents table
CREATE POLICY "Users can view agents from their account" ON public.agents FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can insert agents in their account" ON public.agents FOR INSERT WITH CHECK (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can update agents in their account" ON public.agents FOR UPDATE USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can delete agents in their account" ON public.agents FOR DELETE USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);

-- RLS Policies for agent_stats table
CREATE POLICY "Users can view agent stats from their account" ON public.agent_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_stats.agent_id 
    AND (a.account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin')
  )
);
CREATE POLICY "Admins can manage agent stats in their account" ON public.agent_stats FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.id = agent_stats.agent_id 
    AND ((a.account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
         public.get_current_user_role() = 'superadmin')
  )
);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_stats_updated_at BEFORE UPDATE ON public.agent_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
-- Insert plans
INSERT INTO public.plans (name, description, price, max_users, max_conversations, features) VALUES
('Free', 'Basic plan for small teams', 0.00, 5, 100, '{"basic_support": true, "email_integration": false}'),
('Pro', 'Professional plan for growing businesses', 29.99, 25, 1000, '{"basic_support": true, "email_integration": true, "advanced_analytics": true}'),
('Enterprise', 'Enterprise plan for large organizations', 99.99, 100, 10000, '{"basic_support": true, "email_integration": true, "advanced_analytics": true, "custom_integrations": true}');

-- Insert sample account
INSERT INTO public.accounts (name, email, phone, plan_id, is_active) VALUES
('Empresa Demo', 'admin@empresa.com', '(11) 99999-0000', 2, true);

-- Insert sample user (superadmin for testing)
INSERT INTO public.users (account_id, name, email, role) VALUES
(1, 'Super Admin', 'superadmin@empresa.com', 'superadmin');

-- Insert sample contacts
INSERT INTO public.contacts (account_id, name, email, phone) VALUES
(1, 'João Silva', 'joao@cliente.com', '(11) 98765-4321'),
(1, 'Maria Santos', 'maria@cliente.com', '(11) 97654-3210'),
(1, 'Pedro Costa', 'pedro@cliente.com', '(11) 96543-2109');

-- Insert sample conversations
INSERT INTO public.conversations (account_id, contact_id, status, kanban_stage, priority) VALUES
(1, 1, 'open', 'new', 'high'),
(1, 2, 'pending', 'in_progress', 'medium'),
(1, 3, 'resolved', 'resolved', 'low');

-- Insert sample agents
INSERT INTO public.agents (account_id, name, email, phone, role, status, teams) VALUES
(1, 'Maria Silva', 'maria.silva@empresa.com', '(11) 99999-1111', 'agent', 'online', '{"Vendas"}'),
(1, 'João Santos', 'joao.santos@empresa.com', '(11) 99999-2222', 'supervisor', 'busy', '{"Suporte", "Técnico"}'),
(1, 'Ana Costa', 'ana.costa@empresa.com', '(21) 98888-3333', 'supervisor', 'online', '{"Vendas", "Suporte"}'),
(1, 'Administrador', 'admin@empresa.com', '(11) 99999-0000', 'administrator', 'online', '{"Vendas", "Suporte", "Técnico", "Financeiro"}'),
(1, 'Pedro Costa', 'pedro.costa@empresa.com', '(31) 97777-4444', 'agent', 'offline', '{"Técnico"}'),
(1, 'Lucia Cardoso', 'lucia.cardoso@empresa.com', '(41) 96666-5555', 'agent', 'away', '{"Financeiro"}'),
(1, 'Roberto Ferreira', 'roberto.ferreira@empresa.com', '(51) 95555-6666', 'agent', 'online', '{"Suporte"}'),
(1, 'Carla Souza', 'carla.souza@empresa.com', '(61) 94444-7777', 'supervisor', 'online', '{"Vendas"}'),
(1, 'Thiago Almeida', 'thiago.almeida@empresa.com', '(71) 93333-8888', 'agent', 'busy', '{"Técnico", "Suporte"}'),
(1, 'Beatriz Lima', 'beatriz.lima@empresa.com', '(81) 92222-9999', 'agent', 'online', '{"Financeiro", "Vendas"}');

-- Insert corresponding stats for each agent
INSERT INTO public.agent_stats (agent_id, conversations_today, avg_response_time_seconds, resolution_rate, rating, attendances)
SELECT 
  id,
  FLOOR(RANDOM() * 20 + 1)::INTEGER,
  FLOOR(RANDOM() * 300 + 60)::INTEGER,
  ROUND((RANDOM() * 20 + 80)::NUMERIC, 2),
  ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  FLOOR(RANDOM() * 50 + 1)::INTEGER
FROM public.agents;
