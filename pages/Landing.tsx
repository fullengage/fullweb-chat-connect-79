import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight,
  LogOut,
  Bot,
  Mail,
  Phone,
  CheckCircle,
  Shield,
  Headphones,
  AlertTriangle,
  Clock,
  TrendingDown,
  Star,
  Check,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CRM Hub
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-purple-600 transition">Recursos</a>
              <a href="#planos" className="text-gray-600 hover:text-purple-600 transition">Planos</a>
              <a href="#casos" className="text-gray-600 hover:text-purple-600 transition">Casos de Uso</a>
              <a href="#contato" className="text-gray-600 hover:text-purple-600 transition">Contato</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Olá, {user.email}
                </div>
              )}
              <Button 
                onClick={handleAuthAction}
                disabled={loading}
                variant={user ? "outline" : "ghost"}
                className={user ? "" : "text-purple-600 hover:text-purple-800"}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : user ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              
              {user ? (
                <Button onClick={() => navigate('/dashboard')} className="bg-purple-600 hover:bg-purple-700">
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')} className="bg-purple-600 hover:bg-purple-700">
                  Teste Grátis
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transforme Seu <span className="text-yellow-300">Atendimento</span> em Resultados
              </h1>
              <p className="text-xl mb-8 text-purple-100">
                O CRM Hub centraliza todos os seus canais de atendimento em uma única plataforma inteligente. 
                WhatsApp, Email, Chat e mais - tudo integrado para sua equipe vender mais e atender melhor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 text-lg px-8 py-4"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Começar Teste de 14 Dias
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Ver Demonstração
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-300" />
                  LGPD Compliant
                </div>
                <div className="flex items-center">
                  <Headphones className="h-4 w-4 mr-2 text-green-300" />
                  Suporte brasileiro
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">WhatsApp Business</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-blue-500 text-white p-2 rounded-lg text-sm">Olá! Como posso ajudar?</div>
                    <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm">Preciso de suporte técnico</div>
                    <div className="bg-blue-500 text-white p-2 rounded-lg text-sm">Já estou direcionando para nossa equipe especializada!</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-yellow-100 p-2 rounded text-center">
                    <div className="font-bold text-yellow-800">23</div>
                    <div className="text-yellow-600">Abertas</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <div className="font-bold text-blue-800">15</div>
                    <div className="text-blue-600">Em Andamento</div>
                  </div>
                  <div className="bg-green-100 p-2 rounded text-center">
                    <div className="font-bold text-green-800">142</div>
                    <div className="text-green-600">Resolvidas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600">Mais de 500+ empresas brasileiras confiam no CRM Hub</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="text-center">
                <div className="h-12 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-500">
                  LOGO {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Sua Empresa Está Perdendo <span className="text-red-500">Clientes e Vendas</span> Todos os Dias
            </h2>
            <p className="text-xl text-gray-600">
              Sem um sistema centralizado, sua equipe não consegue acompanhar todos os contatos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Clientes Perdidos</h3>
              <p className="text-gray-600">
                Mensagens no WhatsApp, emails e chats espalhados em diferentes ferramentas. 
                Ninguém sabe quem está cuidando de cada cliente.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Tempo Desperdiçado</h3>
              <p className="text-gray-600">
                Sua equipe perde horas procurando histórico de conversas, duplicando trabalho 
                e sem visibilidade do que cada um está fazendo.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Vendas em Queda</h3>
              <p className="text-gray-600">
                Sem métricas e controle, impossível saber quantas oportunidades estão sendo perdidas 
                ou como melhorar o atendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="recursos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Uma Plataforma. Todos os Canais. <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Resultados Garantidos.</span>
            </h2>
            <p className="text-xl text-gray-600">
              O CRM Hub unifica toda sua operação de atendimento em um só lugar
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-800">
                <MessageSquare className="inline h-8 w-8 text-purple-600 mr-3" />
                Atendimento Omnichannel
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MessageSquare className="h-6 w-6 text-green-500 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">WhatsApp Business Integrado</h4>
                    <p className="text-gray-600">Receba e responda mensagens diretamente na plataforma, com templates e automações</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-blue-500 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Marketing & Suporte</h4>
                    <p className="text-gray-600">Campanhas automatizadas e tickets de suporte em uma única caixa de entrada</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageSquare className="h-6 w-6 text-purple-500 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Chat no Site</h4>
                    <p className="text-gray-600">Widget personalizável que se conecta diretamente com sua equipe</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-orange-500 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Telefone & SMS</h4>
                    <p className="text-gray-600">Integração com centrais telefônicas e envio de SMS em massa</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>WhatsApp</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3 novas</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">7 novas</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>Chat Site</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">2 novas</span>
                  </div>
                  <div className="text-center mt-6">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm opacity-80">Conversas Ativas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestão de Equipes</h3>
              <p className="text-gray-600">
                Distribua automaticamente leads e tickets. Monitore performance individual e defina metas por agente.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automações Inteligentes</h3>
              <p className="text-gray-600">
                Respostas automáticas, distribuição de leads, follow-ups e lembretes. Sua equipe foca no que importa.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Relatórios Completos</h3>
              <p className="text-gray-600">
                Dashboards em tempo real com métricas de vendas, atendimento, performance da equipe e satisfaction score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Resultados Que Nossos Clientes Alcançaram
            </h2>
            <p className="text-xl text-purple-100">
              Empresas reais, números reais, crescimento real
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">+127%</div>
              <div className="text-purple-100">Aumento em vendas online</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">-68%</div>
              <div className="text-purple-100">Redução tempo resposta</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">+89%</div>
              <div className="text-purple-100">Satisfação do cliente</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">+245%</div>
              <div className="text-purple-100">Produtividade da equipe</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              O Que Nossos Clientes Falam
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Regina",
                role: "CEO, Loja da Maria",
                content: "Dobrei minha taxa de conversão em 3 meses. O CRM Hub me ajudou a organizar todo o atendimento e não perder mais nenhum lead do WhatsApp.",
                initial: "MR",
                color: "bg-purple-500"
              },
              {
                name: "Carlos Silva",
                role: "Diretor, TechSolutions",
                content: "Finalmente consegui ter controle total da minha equipe de vendas. O relatório gerencial me mostra exatamente quem está vendendo e quem precisa de coaching.",
                initial: "CS",
                color: "bg-blue-500"
              },
              {
                name: "Ana Ferreira",
                role: "Gerente, Consultoria Plus",
                content: "A integração com WhatsApp mudou nossa operação. Antes perdíamos mensagens, agora tudo fica registrado e nossa equipe consegue responder muito mais rápido.",
                initial: "AF",
                color: "bg-green-500"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${testimonial.color} rounded-full flex items-center justify-center mr-3`}>
                    <span className="text-white font-bold text-sm">{testimonial.initial}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Planos Que Cabem no Seu Orçamento
            </h2>
            <p className="text-xl text-gray-600">
              Comece pequeno e cresça conosco. Sem truques, sem letras miúdas.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Ideal para pequenas empresas</p>
                <div className="text-4xl font-bold text-gray-800">R$ 97<span className="text-lg text-gray-500">/mês</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Até 3 agentes",
                  "1.000 tickets/mês", 
                  "WhatsApp + Email + Chat",
                  "Kanban básico",
                  "Relatórios básicos",
                  "Suporte por email"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">
                Começar Teste Gratuito
              </Button>
            </div>

            {/* Professional */}
            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow border-4 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">MAIS POPULAR</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-gray-600 mb-4">Para empresas em crescimento</p>
                <div className="text-4xl font-bold text-purple-600">R$ 297<span className="text-lg text-gray-500">/mês</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Até 10 agentes",
                  "5.000 tickets/mês",
                  "Todos os canais inclusos",
                  "Kanban avançado + automações",
                  "Relatórios completos",
                  "API access",
                  "Suporte prioritário"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                Começar Teste Gratuito
              </Button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">Para grandes operações</p>
                <div className="text-4xl font-bold text-gray-800">R$ 697<span className="text-lg text-gray-500">/mês</span></div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Agentes ilimitados",
                  "Tickets ilimitados",
                  "White-label completo",
                  "Multi-empresas",
                  "Integrações customizadas",
                  "Suporte dedicado",
                  "SLA garantido"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">
                Falar com Consultor
              </Button>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">
              💳 Aceitamos cartão, boleto e PIX • 🔒 Dados seguros e LGPD • 📞 Suporte brasileiro
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "Como funciona a integração com WhatsApp Business?",
                answer: "A integração é feita via API oficial do WhatsApp Business. Conectamos seu número em poucos minutos e todas as mensagens aparecem diretamente no CRM Hub, mantendo histórico completo."
              },
              {
                question: "Posso migrar meus dados de outro CRM?",
                answer: "Sim! Nossa equipe técnica ajuda gratuitamente na migração de contatos, histórico de conversas e configurações do seu CRM atual para o CRM Hub."
              },
              {
                question: "O sistema funciona offline?",
                answer: "O CRM Hub é baseado na nuvem para garantir sincronização em tempo real entre sua equipe. Funciona em qualquer dispositivo com internet, incluindo celulares."
              },
              {
                question: "Preciso de treinamento para minha equipe?",
                answer: "Incluímos treinamento completo em todos os planos. Sua equipe estará operando o sistema em menos de 1 semana com nosso suporte dedicado."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pare de Perder Clientes. Comece Hoje Mesmo.
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Teste o CRM Hub por 14 dias, sem compromisso. Se não aumentar suas vendas, 
            devolvemos 100% do investimento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 text-lg px-8 py-4"
            >
              <Zap className="h-5 w-5 mr-2" />
              Começar Teste Gratuito Agora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4"
            >
              <Phone className="h-5 w-5 mr-2" />
              Falar com Especialista
            </Button>
          </div>
          <p className="text-sm mt-4 text-purple-200">
            ✅ Sem cartão de crédito • ✅ Configuração em 5 minutos • ✅ Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">CRM Hub</span>
              </div>
              <p className="text-gray-300 mb-4">
                A plataforma completa para transformar seu atendimento em resultados.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
                <li><a href="#" className="hover:text-white transition">Comunidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 CRM Hub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
