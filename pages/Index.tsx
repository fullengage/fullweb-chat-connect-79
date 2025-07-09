
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight,
  LogOut
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Gestão de Conversas",
      description: "Gerencie todas suas conversas do Chatwoot em um só lugar"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançados",
      description: "Análises detalhadas de performance e métricas de atendimento"
    },
    {
      icon: Users,
      title: "Gerenciamento de Equipes",
      description: "Organize suas equipes e otimize a colaboração"
    },
    {
      icon: Bot,
      title: "Agent Bots",
      description: "Automatize respostas com inteligência artificial"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CRM Hub</h1>
                <p className="text-xs text-gray-600">Gestão Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Olá, {user.email}
                </div>
              )}
              <Button 
                onClick={handleAuthAction}
                disabled={loading}
                variant={user ? "outline" : "default"}
                className={user ? "" : "bg-purple-600 hover:bg-purple-700"}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : user ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </>
                ) : (
                  'Fazer Login'
                )}
              </Button>
              
              {user && (
                <Button onClick={() => navigate('/dashboard')}>
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu
            <span className="text-purple-600"> Atendimento</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gerenciar conversas, equipes e análises de atendimento ao cliente com inteligência artificial.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
              >
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-3"
              >
                Ver Demo
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <Zap className="h-12 w-12 text-purple-600 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para revolucionar seu atendimento?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já transformaram seu atendimento ao cliente com nossa plataforma.
          </p>
          
          {user ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
            >
              Ir para Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
            >
              Começar Gratuitamente
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
