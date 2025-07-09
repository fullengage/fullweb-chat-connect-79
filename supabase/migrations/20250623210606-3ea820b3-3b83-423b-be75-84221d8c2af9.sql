
-- Create agents table to store agent information
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id BIGINT NOT NULL,
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

-- Create agent_stats table to track performance metrics
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for agents table
CREATE POLICY "Users can view agents from their account" 
  ON public.agents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND (account_id = agents.account_id OR role = 'superadmin')
    )
  );

CREATE POLICY "Admins can insert agents in their account" 
  ON public.agents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND account_id = agents.account_id 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update agents in their account" 
  ON public.agents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND (account_id = agents.account_id OR role = 'superadmin')
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete agents in their account" 
  ON public.agents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND (account_id = agents.account_id OR role = 'superadmin')
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create policies for agent_stats table
CREATE POLICY "Users can view agent stats from their account" 
  ON public.agent_stats 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.agents a
      JOIN public.users u ON u.auth_user_id = auth.uid()
      WHERE a.id = agent_stats.agent_id 
      AND (u.account_id = a.account_id OR u.role = 'superadmin')
    )
  );

CREATE POLICY "Admins can manage agent stats in their account" 
  ON public.agent_stats 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.agents a
      JOIN public.users u ON u.auth_user_id = auth.uid()
      WHERE a.id = agent_stats.agent_id 
      AND (u.account_id = a.account_id OR u.role = 'superadmin')
      AND u.role IN ('admin', 'superadmin')
    )
  );

-- Insert some sample agents data
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
  FLOOR(RANDOM() * 20 + 1)::INTEGER, -- conversations_today (1-20)
  FLOOR(RANDOM() * 300 + 60)::INTEGER, -- avg_response_time_seconds (1-5 minutes)
  ROUND((RANDOM() * 20 + 80)::NUMERIC, 2), -- resolution_rate (80-100%)
  ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1), -- rating (3.5-5.0)
  FLOOR(RANDOM() * 50 + 1)::INTEGER -- attendances (1-50)
FROM public.agents;

-- Create updated_at trigger
CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON public.agents 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_stats_updated_at 
  BEFORE UPDATE ON public.agent_stats 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
