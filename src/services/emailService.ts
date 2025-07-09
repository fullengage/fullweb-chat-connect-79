
export interface EmailConfig {
  username: string
  password: string
  incomingServer: string
  outgoingServer: string
  protocol: 'IMAP' | 'POP3'
  imapPort: string
  smtpPort: string
  useSSL: boolean
}

export interface EmailMessage {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  preview: string
  body: string
  date: Date
  isRead: boolean
  isImportant: boolean
  hasAttachments: boolean
  folder: string
}

export class EmailService {
  private config: EmailConfig | null = null

  constructor() {
    this.loadConfig()
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem('email_config')
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig)
      } catch (error) {
        console.error('Erro ao carregar configuração de email:', error)
      }
    }
  }

  saveConfig(config: EmailConfig): void {
    localStorage.setItem('email_config', JSON.stringify(config))
    this.config = config
  }

  getConfig(): EmailConfig | null {
    return this.config
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.config) {
      return {
        success: false,
        message: 'Configuração não encontrada'
      }
    }

    console.log('Testando conexão com servidor real:', {
      server: this.config.incomingServer,
      port: this.config.imapPort,
      username: this.config.username,
      protocol: this.config.protocol
    })

    try {
      // Importa e usa o serviço real
      const { RealEmailService } = await import('./realEmailService')
      const realService = new RealEmailService(this.config)
      
      await realService.connect()
      await realService.disconnect()
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso no servidor real',
        details: {
          server: this.config.incomingServer,
          port: this.config.imapPort,
          ssl: this.config.useSSL,
          authenticated: true,
          protocol: this.config.protocol
        }
      }
    } catch (error) {
      console.error('Erro na conexão real:', error)
      return {
        success: false,
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: { 
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          suggestion: 'Verifique as credenciais e configurações do servidor'
        }
      }
    }
  }

  async fetchEmails(): Promise<EmailMessage[]> {
    if (!this.config) {
      throw new Error('Configuração de email não encontrada')
    }

    console.log('Buscando emails do servidor real...')

    try {
      // Importa e usa o serviço real
      const { RealEmailService } = await import('./realEmailService')
      const realService = new RealEmailService(this.config)
      
      const emails = await realService.fetchEmails(50)
      await realService.disconnect()
      
      console.log(`${emails.length} emails recuperados do servidor`)
      return emails
      
    } catch (error) {
      console.error('Erro ao buscar emails:', error)
      throw new Error(`Falha ao buscar emails: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
}

export const emailService = new EmailService()
