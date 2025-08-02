import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Menu,
  X,
  User,
  Building,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter
} from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Simulation de données
  const mockData = {
    collecteur: {
      id: 'col-001',
      name: 'SARL BENIN COMMERCE',
      email: 'contact@benincommerce.bj',
      clients: 45,
      totalCommissions: 12500,
      pendingCommissions: 3200
    },
    clients: [
      { id: 'CLT-001234', name: 'Adjovi Kossou', phone: '+22997123456', status: 'active', cotisations: 15, total: 7500 },
      { id: 'CLT-001235', name: 'Martine Gbedo', phone: '+22996654321', status: 'late', cotisations: 8, total: 4000 },
      { id: 'CLT-001236', name: 'Thomas Agbo', phone: '+22998765432', status: 'active', cotisations: 22, total: 11000 }
    ],
    admin: {
      totalCollecteurs: 127,
      pendingCollecteurs: 8,
      totalClients: 5420,
      totalRevenue: 1245000
    }
  };

  // Composant de connexion
  const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '', showPassword: false });
    const [role, setRole] = useState('collecteur');

    const handleLogin = (e) => {
      e.preventDefault();
      // Simulation connexion
      if (role === 'admin') {
        setCurrentUser({ role: 'admin', name: 'Administrateur' });
        setCurrentView('admin-dashboard');
      } else {
        setCurrentUser({ role: 'collecteur', ...mockData.collecteur });
        setCurrentView('collecteur-dashboard');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Qwetche</h1>
            <p className="text-gray-600">Plateforme de gestion des souscriptions</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setRole('collecteur')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                role === 'collecteur' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Collecteur
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                role === 'admin' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Adresse email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="relative">
              <input
                type={formData.showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                onClick={() => setFormData({...formData, showPassword: !formData.showPassword})}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Demo - Utilisez n'importe quel email/mot de passe</p>
          </div>
        </div>
      </div>
    );
  };

  // Header avec navigation
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Qwetche</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
            <button className="p-2 text-gray-600 hover:text-gray-800 relative">
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="hidden md:block text-gray-700">
              {currentUser?.name || 'Utilisateur'}
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentUser(null);
              setCurrentView('login');
            }}
            className="p-2 text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );

  // Sidebar
  const Sidebar = () => {
    const collecteurMenuItems = [
      { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
      { id: 'clients', icon: Users, label: 'Mes clients' },
      { id: 'add-client', icon: Plus, label: 'Nouveau client' },
      { id: 'commissions', icon: DollarSign, label: 'Commissions' },
      { id: 'settings', icon: Settings, label: 'Paramètres' }
    ];

    const adminMenuItems = [
      { id: 'admin-dashboard', icon: BarChart3, label: 'Vue d\'ensemble' },
      { id: 'collecteurs', icon: Building, label: 'Collecteurs' },
      { id: 'validation', icon: CheckCircle, label: 'Validations' },
      { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
      { id: 'settings', icon: Settings, label: 'Configuration' }
    ];

    const menuItems = currentUser?.role === 'admin' ? adminMenuItems : collecteurMenuItems;

    return (
      <aside className={`bg-gray-900 text-white w-64 min-h-screen fixed md:relative transition-transform duration-300 z-20 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold">
              {currentUser?.role === 'admin' ? 'Administration' : 'Collecteur'}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    );
  };

  // Dashboard Collecteur
  const CollecteurDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setCurrentView('add-client')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau client</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Clients actifs</p>
              <p className="text-2xl font-bold text-gray-800">{mockData.collecteur.clients}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Commissions dues</p>
              <p className="text-2xl font-bold text-red-600">{mockData.collecteur.pendingCommissions.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total collecté</p>
              <p className="text-2xl font-bold text-green-600">{mockData.collecteur.totalCommissions.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taux de recouvrement</p>
              <p className="text-2xl font-bold text-blue-600">87%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Commissions en retard</p>
            <p className="text-red-600 text-sm">3 commissions doivent être réglées sous 2 jours pour éviter la suspension</p>
          </div>
          <button className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Régler maintenant
          </button>
        </div>
      </div>

      {/* Liste des clients récents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Clients récents</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockData.clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{client.total.toLocaleString()} FCFA</p>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      client.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm text-gray-600">{client.cotisations} cotisations</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Vue liste des clients
  const ClientsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Mes clients</h1>
          <button 
            onClick={() => setCurrentView('add-client')}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau client</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="late">En retard</option>
            <option value="completed">Terminés</option>
          </select>
        </div>

        {/* Grille des clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockData.clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.status === 'active' ? 'À jour' : 'En retard'}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-1">{client.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{client.id}</p>
              <p className="text-sm text-gray-600 mb-4">{client.phone}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cotisations:</span>
                  <span className="font-medium">{client.cotisations}/31</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(client.cotisations / 31) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-green-600">{client.total.toLocaleString()} FCFA</span>
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentView('client-detail')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Voir détails
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Formulaire d'ajout de client
  const AddClientForm = () => {
    const [formData, setFormData] = useState({
      nom_complet: '',
      telephone: '',
      email: '',
      montant_journalier: '500',
      type_cycle: '31_jours',
      preferences_notification: 'sms'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Simulation de création
      alert(`Client ${formData.nom_complet} créé avec succès !`);
      setCurrentView('clients');
    };

    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Nouveau client</h1>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.nom_complet}
                    onChange={(e) => setFormData({...formData, nom_complet: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    placeholder="+229..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant journalier
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.montant_journalier}
                    onChange={(e) => setFormData({...formData, montant_journalier: e.target.value})}
                  >
                    <option value="200">200 FCFA</option>
                    <option value="500">500 FCFA</option>
                    <option value="1000">1000 FCFA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de cycle
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.type_cycle}
                    onChange={(e) => setFormData({...formData, type_cycle: e.target.value})}
                  >
                    <option value="31_jours">31 jours</option>
                    <option value="90_jours">90 jours</option>
                    <option value="180_jours">180 jours</option>
                    <option value="365_jours">365 jours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notifications
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.preferences_notification}
                    onChange={(e) => setFormData({...formData, preferences_notification: e.target.value})}
                  >
                    <option value="sms">SMS uniquement</option>
                    <option value="email">Email uniquement</option>
                    <option value="both">SMS et Email</option>
                    <option value="none">Aucune</option>
                  </select>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Récapitulatif de la souscription</h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• Durée: {formData.type_cycle.replace('_', ' ')}</p>
                  <p>• Cotisation: {formData.montant_journalier} FCFA/jour</p>
                  <p>• Total prévu: {(parseInt(formData.montant_journalier) * parseInt(formData.type_cycle.split('_')[0])).toLocaleString()} FCFA</p>
                  <p>• Commission collecteur: 100 FCFA (à régler sous 6 jours)</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentView('clients')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Créer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Administrateur
  const AdminDashboard = () => (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble - Administration</h1>

      {/* Cartes statistiques admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collecteurs actifs</p>
              <p className="text-2xl font-bold text-gray-800">{mockData.admin.totalCollecteurs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente validation</p>
              <p className="text-2xl font-bold text-orange-600">{mockData.admin.pendingCollecteurs}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total clients</p>
              <p className="text-2xl font-bold text-green-600">{mockData.admin.totalClients.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenus générés</p>
              <p className="text-2xl font-bold text-purple-600">{mockData.admin.totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Demandes en attente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Demandes d'inscription en attente</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'SARL TOGO INVEST', email: 'contact@togoinvest.tg', registre: 'RC-2024-001234', date: '2024-01-15' },
              { name: 'ETS KOFFI & FILS', email: 'info@koffifils.bj', registre: 'RC-2024-001235', date: '2024-01-14' }
            ].map((demande, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{demande.name}</p>
                    <p className="text-sm text-gray-600">{demande.email}</p>
                    <p className="text-xs text-gray-500">Registre: {demande.registre}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques et analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution mensuelle</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[40, 65, 80, 45, 90, 75, 85, 95, 70, 60, 85, 100].map((height, index) => (
              <div key={index} className="flex-1 bg-blue-200 rounded-t hover:bg-blue-300 transition-colors cursor-pointer" style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Fév</span>
            <span>Mar</span>
            <span>Avr</span>
            <span>Mai</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aoû</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Déc</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Collecteurs</h3>
          <div className="space-y-3">
            {[
              { name: 'SARL BENIN COMMERCE', clients: 45, revenue: 12500 },
              { name: 'ETS ADJOVI', clients: 38, revenue: 9800 },
              { name: 'KOFFI & ASSOCIES', clients: 32, revenue: 8200 }
            ].map((collecteur, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{collecteur.name}</p>
                    <p className="text-xs text-gray-600">{collecteur.clients} clients</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600 text-sm">{collecteur.revenue.toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Vue détail client avec calendrier de cotisations
  const ClientDetail = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const client = mockData.clients[0];
    
    // Génération du calendrier (simulation)
    const generateCalendar = () => {
      const daysInMonth = 31;
      const days = [];
      
      for (let i = 1; i <= daysInMonth; i++) {
        const isPaid = Math.random() > 0.3; // Simulation
        const isLate = !isPaid && i < new Date().getDate();
        
        days.push({
          day: i,
          status: isPaid ? 'paid' : isLate ? 'late' : 'pending'
        });
      }
      return days;
    };

    const calendarDays = generateCalendar();

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('clients')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Détail client - {client.name}</h1>
        </div>

        {/* Informations client */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Informations client</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Code client</p>
                  <p className="font-medium">{client.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Progression</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Cotisations</span>
                  <span className="font-medium">{client.cotisations}/31</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(client.cotisations / 31) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-2xl font-bold text-green-600">{client.total.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-600">Total cotisé</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Marquer cotisation du jour
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Envoyer notification
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                Voir historique complet
              </button>
            </div>
          </div>
        </div>

        {/* Calendrier des cotisations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Calendrier des cotisations</h3>
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {[
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
              ].map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Légende */}
          <div className="flex items-center justify-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Payé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">En retard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">En attente</span>
            </div>
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((dayData) => (
              <button
                key={dayData.day}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
                  dayData.status === 'paid'
                    ? 'bg-green-500 border-green-500 text-white'
                    : dayData.status === 'late'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400'
                }`}
              >
                <span>{dayData.day}</span>
                {dayData.status === 'paid' && (
                  <CheckCircle className="w-3 h-3 absolute translate-x-2 -translate-y-2" />
                )}
                {dayData.status === 'late' && (
                  <XCircle className="w-3 h-3 absolute translate-x-2 -translate-y-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Client Public (pour les clients)
  const ClientPublicDashboard = () => {
    const [clientCode, setClientCode] = useState('');
    const [clientData, setClientData] = useState(null);

    const searchClient = () => {
      if (clientCode.trim()) {
        // Simulation de recherche
        setClientData(mockData.clients[0]);
      }
    };

    if (!clientData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Espace Client</h1>
              <p className="text-gray-600">Consultez l'état de vos souscriptions</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code client
                </label>
                <input
                  type="text"
                  placeholder="CLT-001234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                />
              </div>
              
              <button
                onClick={searchClient}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Consulter mes souscriptions
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentView('login')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Espace collecteur/admin
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Qwetche</span>
            </div>
            <button
              onClick={() => setClientData(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* En-tête client */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{clientData.name}</h1>
                <p className="text-gray-600">{clientData.id}</p>
                <p className="text-sm text-green-600 font-medium">✅ Compte actif</p>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ma progression</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full border-4 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-green-500"
                    style={{
                      background: `conic-gradient(#10B981 ${(clientData.cotisations / 31) * 360}deg, transparent 0deg)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{Math.round((clientData.cotisations / 31) * 100)}%</span>
                  </div>
                </div>
                <p className="font-medium text-gray-800">Progression</p>
                <p className="text-sm text-gray-600">{clientData.cotisations}/31 jours</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{clientData.total.toLocaleString()}</div>
                <p className="font-medium text-gray-800">FCFA cotisés</p>
                <p className="text-sm text-gray-600">Total accumulé</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{(clientData.total * 0.8).toLocaleString()}</div>
                <p className="font-medium text-gray-800">FCFA disponibles</p>
                <p className="text-sm text-gray-600">Pour prêt (80%)</p>
              </div>
            </div>
          </div>

          {/* Notifications récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications récentes</h2>
            <div className="space-y-3">
              {[
                { type: 'success', message: 'Cotisation du 15/01 enregistrée avec succès', time: '2h' },
                { type: 'reminder', message: 'Rappel: Prochaine cotisation due demain', time: '1j' },
                { type: 'info', message: 'Rapport hebdomadaire disponible', time: '3j' }
              ].map((notif, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  notif.type === 'success' ? 'bg-green-50 border-green-500' :
                  notif.type === 'reminder' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Il y a {notif.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vue de gestion des commissions
  const CommissionsView = () => {
    const [selectedCommissions, setSelectedCommissions] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('mtn');

    const commissions = [
      { id: 1, client: 'Adjovi Kossou', code: 'CLT-001234', montant: 100, dateCreation: '2024-01-10', dateEcheance: '2024-01-16', status: 'pending' },
      { id: 2, client: 'Martine Gbedo', code: 'CLT-001235', montant: 100, dateCreation: '2024-01-12', dateEcheance: '2024-01-18', status: 'overdue' },
      { id: 3, client: 'Thomas Agbo', code: 'CLT-001236', montant: 100, dateCreation: '2024-01-08', dateEcheance: '2024-01-14', status: 'paid' }
    ];

    const handlePaySelected = () => {
      if (selectedCommissions.length === 0) {
        alert('Veuillez sélectionner au moins une commission');
        return;
      }
      
      const total = selectedCommissions.reduce((sum, id) => {
        const commission = commissions.find(c => c.id === id);
        return sum + commission.montant;
      }, 0);

      alert(`Paiement de ${total} FCFA initié via ${paymentMethod.toUpperCase()}`);
    };

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des commissions</h1>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm">Total dû</p>
            <p className="text-2xl font-bold text-red-600">200 FCFA</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm">Payé ce mois</p>
            <p className="text-2xl font-bold text-green-600">500 FCFA</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm">Commissions en retard</p>
            <p className="text-2xl font-bold text-orange-600">1</p>
          </div>
        </div>

        {/* Actions groupées */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="mtn">MTN Mobile Money</option>
                <option value="moov">Moov Money</option>
                <option value="celtiis">Celtiis MoMo</option>
              </select>
              <span className="text-sm text-gray-600">
                {selectedCommissions.length} sélectionnée(s)
              </span>
            </div>
            <button
              onClick={handlePaySelected}
              disabled={selectedCommissions.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Payer les commissions sélectionnées
            </button>
          </div>
        </div>

        {/* Liste des commissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Liste des commissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Client</th>
                  <th className="text-left p-4 font-medium text-gray-700">Code</th>
                  <th className="text-left p-4 font-medium text-gray-700">Montant</th>
                  <th className="text-left p-4 font-medium text-gray-700">Échéance</th>
                  <th className="text-left p-4 font-medium text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(commission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCommissions([...selectedCommissions, commission.id]);
                          } else {
                            setSelectedCommissions(selectedCommissions.filter(id => id !== commission.id));
                          }
                        }}
                        disabled={commission.status === 'paid'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{commission.client}</p>
                        <p className="text-sm text-gray-600">Créé le {commission.dateCreation}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{commission.code}</td>
                    <td className="p-4 font-medium text-gray-800">{commission.montant} FCFA</td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-800">{commission.dateEcheance}</p>
                        {commission.status === 'overdue' && (
                          <p className="text-xs text-red-600">En retard</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        commission.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : commission.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {commission.status === 'paid' ? 'Payé' : commission.status === 'overdue' ? 'En retard' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Vue des collecteurs (Admin)
  const CollecteursManagement = () => {
    const [collecteurs] = useState([
      { id: 1, nom: 'SARL BENIN COMMERCE', email: 'contact@benincommerce.bj', clients: 45, revenue: 12500, status: 'active', lastLogin: '2024-01-15' },
      { id: 2, nom: 'ETS ADJOVI', email: 'info@adjovi.bj', clients: 38, revenue: 9800, status: 'active', lastLogin: '2024-01-14' },
      { id: 3, nom: 'KOFFI & ASSOCIES', email: 'contact@koffi.bj', clients: 32, revenue: 8200, status: 'blocked', lastLogin: '2024-01-10' }
    ]);

    const handleAction = (id, action) => {
      const collecteur = collecteurs.find(c => c.id === id);
      alert(`Action ${action} effectuée sur ${collecteur.nom}`);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des collecteurs</h1>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Exporter rapport
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Entreprise</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Clients</th>
                  <th className="text-left p-4 font-medium text-gray-700">Revenus</th>
                  <th className="text-left p-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-700">Dernière connexion</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collecteurs.map((collecteur) => (
                  <tr key={collecteur.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="font-medium text-gray-800">{collecteur.nom}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{collecteur.email}</td>
                    <td className="p-4 font-medium text-gray-800">{collecteur.clients}</td>
                    <td className="p-4 font-medium text-green-600">{collecteur.revenue.toLocaleString()} FCFA</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        collecteur.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {collecteur.status === 'active' ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{collecteur.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(collecteur.id, 'view')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {collecteur.status === 'blocked' ? (
                          <button
                            onClick={() => handleAction(collecteur.id, 'unblock')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(collecteur.id, 'block')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Vue Analytics détaillée (Admin)
  const AnalyticsView = () => {
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    const analyticsData = {
      revenue: [120, 190, 300, 500, 200, 300, 450, 600, 400, 350, 520, 480],
      clients: [10, 15, 25, 35, 45, 55, 70, 85, 95, 105, 120, 130],
      collecteurs: [5, 8, 12, 15, 18, 22, 26, 30, 33, 36, 40, 42]
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Rapports</h1>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Exporter PDF
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setSelectedMetric('revenue')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedMetric === 'revenue' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">1,245,000</p>
              <p className="text-gray-600">Revenus FCFA</p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs mois dernier</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedMetric('clients')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedMetric === 'clients' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">5,420</p>
              <p className="text-gray-600">Clients actifs</p>
              <p className="text-sm text-green-600 mt-1">+8.3% vs mois dernier</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedMetric('collecteurs')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedMetric === 'collecteurs' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-center">
              <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">127</p>
              <p className="text-gray-600">Collecteurs</p>
              <p className="text-sm text-green-600 mt-1">+5.2% vs mois dernier</p>
            </div>
          </button>
        </div>

        {/* Graphique principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Évolution {selectedMetric === 'revenue' ? 'des revenus' : selectedMetric === 'clients' ? 'des clients' : 'des collecteurs'}
          </h3>
          <div className="h-80 flex items-end justify-between space-x-1">
            {analyticsData[selectedMetric].map((value, index) => {
              const maxValue = Math.max(...analyticsData[selectedMetric]);
              const height = (value / maxValue) * 100;
              const color = selectedMetric === 'revenue' ? 'bg-purple-500' : selectedMetric === 'clients' ? 'bg-green-500' : 'bg-blue-500';
              
              return (
                <div
                  key={index}
                  className={`flex-1 ${color} rounded-t hover:opacity-80 transition-all cursor-pointer relative group`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par région</h3>
            <div className="space-y-3">
              {[
                { region: 'Littoral (Cotonou)', count: 45, percent: 35 },
                { region: 'Ouémé (Porto-Novo)', count: 32, percent: 25 },
                { region: 'Atlantique', count: 28, percent: 22 },
                { region: 'Borgou (Parakou)', count: 15, percent: 12 },
                { region: 'Autres', count: 7, percent: 6 }
              ].map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-800">{region.region}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${region.percent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-8">{region.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des cycles</h3>
            <div className="space-y-4">
              {[
                { cycle: '31 jours', clients: 2840, completion: 89, revenue: 568000 },
                { cycle: '90 jours', clients: 1650, completion: 76, revenue: 742500 },
                { cycle: '180 jours', clients: 780, completion: 82, revenue: 702000 },
                { cycle: '365 jours', clients: 150, completion: 71, revenue: 273750 }
              ].map((cycle, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{cycle.cycle}</span>
                    <span className="text-sm text-gray-600">{cycle.clients} clients</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux de completion</span>
                    <span className="font-medium text-green-600">{cycle.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${cycle.completion}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Revenus: {cycle.revenue.toLocaleString()} FCFA</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vue des paramètres
  const SettingsView = () => {
    const [settings, setSettings] = useState({
      notifications: {
        email: true,
        sms: true,
        push: false
      },
      commissions: {
        montant: 100,
        delai: 6
      },
      cycles: {
        montants: [200, 500, 1000],
        durees: [31, 90, 180, 365]
      }
    });

    const updateSetting = (category, key, value) => {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    };

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{key}</span>
                  <button
                    onClick={() => updateSetting('notifications', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Commissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration des commissions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant par inscription (FCFA)
                </label>
                <input
                  type="number"
                  value={settings.commissions.montant}
                  onChange={(e) => updateSetting('commissions', 'montant', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  value={settings.commissions.delai}
                  onChange={(e) => updateSetting('commissions', 'delai', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cycles disponibles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycles de souscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durées disponibles (jours)
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.cycles.durees.map((duree, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {duree} jours
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montants journaliers (FCFA)
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.cycles.montants.map((montant, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {montant} FCFA
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sécurité</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Authentification 2FA</p>
                  <p className="text-sm text-gray-600">Protection supplémentaire du compte</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Configurer
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Changer mot de passe</p>
                  <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            onClick={() => alert('Paramètres sauvegardés avec succès')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    );
  };

  // Inscription collecteur
  const CollecteurRegistration = () => {
    const [formData, setFormData] = useState({
      nom_entreprise: '',
      email: '',
      password: '',
      confirmPassword: '',
      numero_registre_commerce: '',
      emplacement_physique: '',
      phone: ''
    });
    const [step, setStep] = useState(1);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (step < 3) {
        setStep(step + 1);
      } else {
        alert('Demande d\'inscription soumise avec succès ! Vous recevrez un email de confirmation.');
        setCurrentView('login');
      }
    };

    const renderStep = () => {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Informations de l'entreprise</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.nom_entreprise}
                  onChange={(e) => setFormData({...formData, nom_entreprise: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de registre de commerce *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.numero_registre_commerce}
                  onChange={(e) => setFormData({...formData, numero_registre_commerce: e.target.value})}
                  placeholder="RC-2024-001234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emplacement physique *</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={formData.emplacement_physique}
                  onChange={(e) => setFormData({...formData, emplacement_physique: e.target.value})}
                  placeholder="Adresse exacte du lieu d'activité..."
                  required

  // Vue de validation des collecteurs (Admin)
  const CollecteurValidation = () => {
    const [pendingCollecteurs, setPendingCollecteurs] = useState([
      {
        id: 1,
        nomEntreprise: 'SARL NOUVEAU COMMERCE',
        email: 'contact@nouveaucommerce.bj',
        registre: 'RC-2024-001240',
        emplacement: 'Quartier Haie Vive, Cotonou',
        datedemande: '2024-01-15',
        documents: ['Registre de commerce', 'Localisation GPS']
      },
      {
        id: 2,
        nomEntreprise: 'ETS GRACE & BENEDICTION',
        email: 'info@gracebene.bj',
        registre: 'RC-2024-001241',
        emplacement: 'Marché Dantokpa, Porto-Novo',
        datedemande: '2024-01-14',
        documents: ['Registre de commerce', 'Localisation GPS', 'Photos local']
      }
    ]);

    const handleValidation = (id, action) => {
      const collecteur = pendingCollecteurs.find(c => c.id === id);
      if (action === 'approve') {
        alert(`Collecteur ${collecteur.nomEntreprise} approuvé avec succès`);
      } else {
        alert(`Demande de ${collecteur.nomEntreprise} rejetée`);
      }
      setPendingCollecteurs(pendingCollecteurs.filter(c => c.id !== id));
    };

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Validation des collecteurs</h1>

        <div className="grid gap-6">
          {pendingCollecteurs.map((collecteur) => (
            <div key={collecteur.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{collecteur.nomEntreprise}</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{collecteur.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Registre: {collecteur.registre}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-4 h-4 text-gray-400 mt-0.5">📍</div>
                          <span className="text-sm text-gray-600">{collecteur.emplacement}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Documents fournis:</p>
                    <div className="flex flex-wrap gap-2">
                      {collecteur.documents.map((doc, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Demande reçue le</p>
                    <p className="font-medium text-gray-800">{collecteur.datedemande}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleValidation(collecteur.id, 'approve')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approuver</span>
                    </button>
                    
                    <button
                      onClick={() => handleValidation(collecteur.id, 'reject')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
                    
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                      Demander plus d'infos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingCollecteurs.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune demande en attente</h3>
            <p className="text-gray-600">Toutes les demandes de collecteurs ont été traitées.</p>
          </div>
        )}
      </div>
    );
  };

  // Fonction de rendu principal
  const renderCurrentView = () => {
    if (!currentUser) {
      if (currentView === 'client-public') {
        return <ClientPublicDashboard />;
      }
      return <LoginForm />;
    }

    switch (currentView) {
      case 'collecteur-dashboard':
      case 'dashboard':
        return <CollecteurDashboard />;
      case 'clients':
        return <ClientsList />;
      case 'add-client':
        return <AddClientForm />;
      case 'client-detail':
        return <ClientDetail />;
      case 'commissions':
        return <CommissionsView />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'validation':
        return <CollecteurValidation />;
      default:
        return <CollecteurDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header et sidebar seulement si connecté */}
      {currentUser && (
        <>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen">
              {renderCurrentView()}
            </main>
          </div>
        </>
      )}

      {/* Vue publique ou connexion */}
      {!currentUser && (
        <div>
          {currentView !== 'client-public' && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setCurrentView('client-public')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Espace Client
              </button>
            </div>
          )}
          {renderCurrentView()}
        </div>
      )}

      {/* Overlay pour mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;-left p-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommissions(commissions.filter(c => c.status !== 'paid').map(c => c.id));
                        } else {
                          setSelectedCommissions([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text
