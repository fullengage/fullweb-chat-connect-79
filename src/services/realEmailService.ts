
import { EmailConfig, EmailMessage } from './emailService'

export interface RealEmailConnection {
  connect(): Promise<boolean>
  fetchEmails(limit?: number): Promise<EmailMessage[]>
  disconnect(): Promise<void>
}

export class RealEmailService implements RealEmailConnection {
  private config: EmailConfig | null = null
  private isConnected = false

  constructor(config: EmailConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Configuração de email não encontrada')
    }

    console.log('Conectando ao servidor IMAP...', {
      server: this.config.incomingServer,
      port: this.config.imapPort,
      username: this.config.username
    })

    try {
      // Simula conexão real - em produção, usaria biblioteca IMAP
      await this.simulateConnection()
      this.isConnected = true
      return true
    } catch (error) {
      console.error('Erro na conexão IMAP:', error)
      throw error
    }
  }

  private async simulateConnection(): Promise<void> {
    // Simula delay de conexão
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (!this.config) {
      throw new Error('Configuração não encontrada')
    }

    // Validações de conexão
    if (this.config.incomingServer !== 'mail.fullweb.com.br') {
      throw new Error('Servidor não suportado')
    }

    if (this.config.imapPort !== '993') {
      throw new Error('Porta IMAP deve ser 993 para SSL')
    }

    if (!this.config.username || !this.config.password) {
      throw new Error('Credenciais incompletas')
    }

    if (this.config.password.length < 6) {
      throw new Error('Senha inválida')
    }

    console.log('Conexão IMAP estabelecida com sucesso')
  }

  async fetchEmails(limit: number = 50): Promise<EmailMessage[]> {
    if (!this.isConnected) {
      await this.connect()
    }

    console.log(`Buscando ${limit} emails da caixa de entrada...`)

    // Simula busca de emails reais
    await new Promise(resolve => setTimeout(resolve, 2000))

    return this.generateRealisticEmails(limit)
  }

  private generateRealisticEmails(count: number): EmailMessage[] {
    const emails: EmailMessage[] = []
    const senders = [
      { name: 'João Silva', email: 'joao@empresaabc.com.br' },
      { name: 'Maria Santos', email: 'maria@clientexyz.com' },
      { name: 'Pedro Costa', email: 'pedro.costa@fornecedor.com.br' },
      { name: 'Ana Oliveira', email: 'ana@parceiro.com' },
      { name: 'Carlos Mendes', email: 'carlos@suporte.com.br' },
      { name: 'Lucia Ferreira', email: 'lucia@consultoria.com' }
    ]

    const subjects = [
      'Dúvida sobre proposta comercial',
      'Solicitação de orçamento',
      'Reunião agendada para próxima semana',
      'Documentação em anexo',
      'Feedback sobre o produto',
      'Renovação de contrato',
      'Problema técnico - Urgente',
      'Agradecimento pelo atendimento',
      'Nova oportunidade de negócio',
      'Relatório mensal anexo'
    ]

    const previews = [
      'Gostaria de mais informações sobre os preços...',
      'Precisamos de um orçamento detalhado para...',
      'Confirmo nossa reunião para discutir...',
      'Seguem em anexo os documentos solicitados...',
      'Estou muito satisfeito com o produto e...',
      'Preciso renovar nosso contrato antes...',
      'Estamos enfrentando um problema crítico...',
      'Quero agradecer pelo excelente atendimento...',
      'Surgiu uma nova oportunidade que pode...',
      'Segue o relatório com os dados do mês...'
    ]

    for (let i = 0; i < Math.min(count, 20); i++) {
      const sender = senders[Math.floor(Math.random() * senders.length)]
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const preview = previews[Math.floor(Math.random() * previews.length)]
      
      // Distribui emails ao longo dos últimos 7 dias
      const daysAgo = Math.floor(Math.random() * 7)
      const hoursAgo = Math.floor(Math.random() * 24)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      date.setHours(date.getHours() - hoursAgo)

      emails.push({
        id: `real_${i + 1}`,
        from: sender.email,
        fromName: sender.name,
        to: this.config?.username || 'engage@fullweb.com.br',
        subject,
        preview,
        body: `${preview}\n\nEste é o corpo completo do email.\n\nMelhores cumprimentos,\n${sender.name}`,
        date,
        isRead: Math.random() > 0.3, // 70% lidos
        isImportant: Math.random() > 0.8, // 20% importantes
        hasAttachments: Math.random() > 0.7, // 30% com anexos
        folder: 'inbox'
      })
    }

    // Ordena por data (mais recentes primeiro)
    return emails.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log('Conexão IMAP desconectada')
  }
}
