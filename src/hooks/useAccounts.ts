
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface Account {
  id: number
  name: string
  email: string
  phone?: string
  cnpj?: string
  city?: string
  state?: string
  industry?: string
  description?: string
  plan_id?: number
  plan_name?: string
  is_active: boolean
  current_users?: number
  current_conversations?: number
  subscription_expires_at?: string
  created_at: string
  updated_at: string
}

export interface CreateAccountData {
  name: string
  email: string
  phone?: string
  cnpj?: string
  city?: string
  state?: string
  industry?: string
  description?: string
  plan_id?: number
  is_active: boolean
}

export interface UpdateAccountData extends CreateAccountData {
  id: number
}

// Hook para buscar contas (apenas para superadmin)
export const useAccounts = () => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['accounts', authUser?.id],
    queryFn: async () => {
      console.log('Fetching accounts...')
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Verificar se o usuário é superadmin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('User data error:', userError)
        throw new Error('User data not found')
      }

      if (userData.role !== 'superadmin') {
        throw new Error('Access denied: Only superadmin can view accounts')
      }

      // Buscar contas com informações de planos
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          plans!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar contas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Transform data to include plan name
      const accountsWithPlan = data?.map(account => ({
        ...account,
        plan_name: account.plans?.name || 'Sem plano'
      })) || []

      console.log('Accounts fetched successfully:', accountsWithPlan.length)
      return accountsWithPlan as Account[]
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook para criar conta
export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useMutation({
    mutationFn: async (accountData: CreateAccountData) => {
      console.log('Creating account:', accountData)

      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Verificar se o usuário é superadmin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData || userData.role !== 'superadmin') {
        throw new Error('Access denied: Only superadmin can create accounts')
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert(accountData)
        .select()
        .single()

      if (error) {
        console.error('Error creating account:', error)
        throw error
      }

      console.log('Account created successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Conta criada",
        description: "Nova conta empresarial criada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating account:', error)
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para atualizar conta
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useMutation({
    mutationFn: async (accountData: UpdateAccountData) => {
      console.log('Updating account:', accountData)

      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Verificar se o usuário é superadmin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData || userData.role !== 'superadmin') {
        throw new Error('Access denied: Only superadmin can update accounts')
      }

      const { id, ...updateData } = accountData
      const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating account:', error)
        throw error
      }

      console.log('Account updated successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Conta atualizada",
        description: "Dados da conta atualizados com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error updating account:', error)
      toast({
        title: "Erro ao atualizar conta",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para deletar conta (soft delete)
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useMutation({
    mutationFn: async (accountId: number) => {
      console.log('Deactivating account:', accountId)

      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Verificar se o usuário é superadmin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData || userData.role !== 'superadmin') {
        throw new Error('Access denied: Only superadmin can deactivate accounts')
      }

      const { data, error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .select()
        .single()

      if (error) {
        console.error('Error deactivating account:', error)
        throw error
      }

      console.log('Account deactivated successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: "Conta desativada",
        description: "Conta empresarial desativada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error deactivating account:', error)
      toast({
        title: "Erro ao desativar conta",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}
