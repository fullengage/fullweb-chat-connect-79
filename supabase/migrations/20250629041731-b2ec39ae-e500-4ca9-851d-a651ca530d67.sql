
-- Criar tabela de quadros Kanban
CREATE TABLE public.kanban_boards (
  id BIGSERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('team', 'agents_only', 'admins_only')),
  background_color TEXT DEFAULT '#f8f9fa',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, name)
);

-- Criar tabela de colunas do Kanban
CREATE TABLE public.kanban_columns (
  id BIGSERIAL PRIMARY KEY,
  board_id BIGINT NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  position INTEGER NOT NULL,
  max_cards INTEGER,
  auto_assign_agent BOOLEAN DEFAULT false,
  is_final_stage BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(board_id, position),
  UNIQUE(board_id, name)
);

-- Criar tabela de posição das conversas no Kanban
CREATE TABLE public.conversation_kanban (
  id BIGSERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  board_id BIGINT NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  column_id BIGINT NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id),
  position INTEGER NOT NULL,
  moved_by UUID REFERENCES public.users(id),
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, board_id),
  UNIQUE(column_id, position)
);

-- Criar tabela de etiquetas/labels
CREATE TABLE public.kanban_labels (
  id BIGSERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  board_id BIGINT REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, name, board_id)
);

-- Criar tabela de relacionamento conversa-etiqueta
CREATE TABLE public.conversation_labels (
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  label_id BIGINT NOT NULL REFERENCES public.kanban_labels(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id),
  added_by UUID REFERENCES public.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (conversation_id, label_id)
);

-- Adicionar colunas à tabela conversations para melhor integração
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER,
ADD COLUMN IF NOT EXISTS complexity TEXT DEFAULT 'medium' CHECK (complexity IN ('low', 'medium', 'high'));

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_labels ENABLE ROW LEVEL SECURITY;

-- Policies para kanban_boards
CREATE POLICY "Users can view boards from their account" ON public.kanban_boards FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can manage boards in their account" ON public.kanban_boards FOR ALL USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);

-- Policies para kanban_columns
CREATE POLICY "Users can view columns from their account" ON public.kanban_columns FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can manage columns in their account" ON public.kanban_columns FOR ALL USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);

-- Policies para conversation_kanban
CREATE POLICY "Users can view conversation kanban from their account" ON public.conversation_kanban FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Users can manage conversation kanban in their account" ON public.conversation_kanban FOR ALL USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);

-- Policies para kanban_labels
CREATE POLICY "Users can view labels from their account" ON public.kanban_labels FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Admins can manage labels in their account" ON public.kanban_labels FOR ALL USING (
  (account_id = public.get_current_user_account() AND public.get_current_user_role() IN ('admin', 'superadmin')) OR
  public.get_current_user_role() = 'superadmin'
);

-- Policies para conversation_labels
CREATE POLICY "Users can view conversation labels from their account" ON public.conversation_labels FOR SELECT USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);
CREATE POLICY "Users can manage conversation labels in their account" ON public.conversation_labels FOR ALL USING (
  account_id = public.get_current_user_account() OR public.get_current_user_role() = 'superadmin'
);

-- Triggers para updated_at
CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON public.kanban_boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kanban_columns_updated_at BEFORE UPDATE ON public.kanban_columns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para auto-atribuição e mudança de status
CREATE OR REPLACE FUNCTION public.auto_assign_on_column_move()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-atribuir agente quando mover para coluna específica
  IF EXISTS (SELECT 1 FROM public.kanban_columns WHERE id = NEW.column_id AND auto_assign_agent = true) THEN
    UPDATE public.conversations 
    SET assignee_id = (
      SELECT id FROM public.users 
      WHERE account_id = NEW.account_id 
      AND role = 'agent' 
      ORDER BY RANDOM() 
      LIMIT 1
    )
    WHERE id = NEW.conversation_id AND assignee_id IS NULL;
  END IF;
  
  -- Atualizar status da conversa baseado na coluna
  UPDATE public.conversations 
  SET 
    kanban_stage = (SELECT name FROM public.kanban_columns WHERE id = NEW.column_id),
    status = CASE 
      WHEN (SELECT is_final_stage FROM public.kanban_columns WHERE id = NEW.column_id) THEN 'resolved'
      ELSE 'open'
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para automação
CREATE TRIGGER conversation_kanban_auto_assign 
  AFTER INSERT OR UPDATE ON public.conversation_kanban
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_on_column_move();

-- Inserir dados iniciais
-- Board padrão para a conta demo
INSERT INTO public.kanban_boards (account_id, name, description, is_default, created_by) VALUES
(1, 'Atendimento Geral', 'Quadro principal para gerenciamento de tickets', true, (SELECT id FROM public.users WHERE account_id = 1 LIMIT 1));

-- Colunas padrão para o board
INSERT INTO public.kanban_columns (board_id, account_id, name, description, color, position, is_final_stage) VALUES
((SELECT id FROM public.kanban_boards WHERE account_id = 1 AND name = 'Atendimento Geral'), 1, 'Novos', 'Tickets recém-criados', '#ef4444', 1, false),
((SELECT id FROM public.kanban_boards WHERE account_id = 1 AND name = 'Atendimento Geral'), 1, 'Triagem', 'Em análise e classificação', '#f59e0b', 2, false),
((SELECT id FROM public.kanban_boards WHERE account_id = 1 AND name = 'Atendimento Geral'), 1, 'Em Andamento', 'Sendo atendidos ativamente', '#3b82f6', 3, false),
((SELECT id FROM public.kanban_boards WHERE account_id = 1 AND name = 'Atendimento Geral'), 1, 'Aguardando Cliente', 'Esperando resposta do cliente', '#f59e0b', 4, false),
((SELECT id FROM public.kanban_boards WHERE account_id = 1 AND name = 'Atendimento Geral'), 1, 'Resolvidos', 'Tickets finalizados com sucesso', '#10b981', 5, true);

-- Etiquetas padrão
INSERT INTO public.kanban_labels (account_id, name, color) VALUES
(1, 'Urgente', '#dc2626'),
(1, 'Bug', '#7c2d12'),
(1, 'Dúvida', '#2563eb'),
(1, 'Reclamação', '#b91c1c'),
(1, 'Sugestão', '#059669'),
(1, 'Pagamento', '#7c3aed'),
(1, 'Técnico', '#0891b2');

-- Mover conversas existentes para o board padrão
INSERT INTO public.conversation_kanban (conversation_id, board_id, column_id, account_id, position)
SELECT 
  c.id,
  kb.id,
  CASE 
    WHEN c.status = 'open' THEN (SELECT id FROM public.kanban_columns WHERE board_id = kb.id AND name = 'Novos')
    WHEN c.status = 'pending' THEN (SELECT id FROM public.kanban_columns WHERE board_id = kb.id AND name = 'Aguardando Cliente')
    WHEN c.status = 'resolved' THEN (SELECT id FROM public.kanban_columns WHERE board_id = kb.id AND name = 'Resolvidos')
    ELSE (SELECT id FROM public.kanban_columns WHERE board_id = kb.id AND name = 'Novos')
  END,
  c.account_id,
  ROW_NUMBER() OVER (PARTITION BY c.status ORDER BY c.created_at)
FROM public.conversations c
JOIN public.kanban_boards kb ON kb.account_id = c.account_id AND kb.is_default = true
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversation_kanban ck WHERE ck.conversation_id = c.id
);
