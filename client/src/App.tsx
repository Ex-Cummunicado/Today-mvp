import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/auth';

// Import our custom components
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserDashboard } from '@/components/UserDashboard';
import { RequestScribeCard } from '@/components/RequestScribeCard';
import { InseeAssistant } from '@/components/InseeAssistant';
import SearchAndMatchmaking from '@/components/SearchAndMatchmaking';
import GeoLocationMap from '@/components/GeoLocationMap';
import { useTTS } from '@/hooks/use-tts';
import { SIMULATION_USERS, ANIMATIONS } from '@/lib/simulation-data';

// Mock user authentication - TODO: Replace with real auth
type UserRole = 'blind_user' | 'volunteer' | 'admin';
type User = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
};

const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  role: 'blind_user',
  email: 'alex.chen@email.com',
};

// Check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem('inscribemate_user') !== null;
};

// Get current user
const getCurrentUser = (): User => {
  const stored = localStorage.getItem('inscribemate_user');
  if (stored) {
    const user = JSON.parse(stored);
    return {
      id: user.id || 'demo-user',
      name: user.name || 'Demo User',
      email: user.email || 'demo@example.com',
      role: user.role || 'blind_user'
    };
  }
  return mockUser;
};

function DashboardPage() {
  const currentUser = getCurrentUser();
  const tts = useTTS({ enabled: true });

  useEffect(() => {
    tts.speak(`Welcome to your dashboard, ${currentUser.name}. You are logged in as a ${currentUser.role.replace('_', ' ')}.`);
  }, [currentUser, tts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <UserDashboard userRole={currentUser.role} userName={currentUser.name} />
    </motion.div>
  );
}

function RequestPage() {
  const tts = useTTS({ enabled: true });

  useEffect(() => {
    tts.speak('Request a scribe page. Schedule assistance or request immediate help for your exams and academic needs.');
  }, [tts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Request a Scribe</h1>
        <p className="text-muted-foreground">
          Schedule assistance or request immediate help for your exams and academic needs.
        </p>
      </div>
      <RequestScribeCard />
    </motion.div>
  );
}

function SearchPage() {
  const tts = useTTS({ enabled: true });

  useEffect(() => {
    tts.speak('Search and matchmaking page. Find scribe requests and match with volunteers.');
  }, [tts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <SearchAndMatchmaking />
    </motion.div>
  );
}

function MapPage() {
  const tts = useTTS({ enabled: true });

  useEffect(() => {
    tts.speak('Location map page. View requests and volunteers on an interactive map.');
  }, [tts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <GeoLocationMap />
    </motion.div>
  );
}

function SettingsPage() {
  const tts = useTTS({ enabled: true });

  useEffect(() => {
    tts.speak('Accessibility settings page. Customize your experience with accessibility and preference options.');
  }, [tts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Accessibility Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience with accessibility and preference options.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Display & Contrast</h3>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Adjust theme and contrast settings in the top navigation bar.
            </p>
            <div className="flex gap-2">
              <ThemeToggle />
            </div>
          </div>
          
          <h3 className="text-lg font-medium">Language & Localization</h3>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Choose your preferred language from major Indian languages.
            </p>
            <LanguageSelector />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Accessibility Features</h3>
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Screen Reader Support</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Keyboard Navigation</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast Mode</span>
              <Badge variant="outline">Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Text-to-Speech</span>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Router() {
  const [userRole, setUserRole] = useState<UserRole>(getCurrentUser().role);
  const [location, setLocation] = useLocation();
  
  // Update user role when it changes
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUserRole(currentUser.role);
  }, [location]);

  // Redirect to auth if not authenticated
  if (!isAuthenticated() && location !== '/auth') {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/request" component={RequestPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [location, setLocation] = useLocation();
  const tts = useTTS({ enabled: true });

  // Configure sidebar width for InscribeMate
  const sidebarStyle = {
    '--sidebar-width': '20rem',
    '--sidebar-width-icon': '4rem',
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    localStorage.setItem('inscribemate_user', JSON.stringify(updatedUser));
    toast.success(`Switched to ${newRole.replace('_', ' ')} view`);
    tts.speak(`Switched to ${newRole.replace('_', ' ')} view`);
  };

  const handleLogout = () => {
    localStorage.removeItem('inscribemate_user');
    setCurrentUser(mockUser);
    setLocation('/auth');
    toast.success('Logged out successfully');
    tts.speak('Logged out successfully');
  };

  // Update current user when location changes
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [location]);

  // Show auth page if not authenticated
  if (!isAuthenticated() && location !== '/auth') {
    return <AuthPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar userRole={currentUser.role} />
            <div className="flex flex-col flex-1">
              {/* Header */}
              <header 
                className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                data-testid="app-header"
              >
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="hidden sm:block">
                    <h2 className="text-lg font-semibold">InscribeMate</h2>
                    <p className="text-xs text-muted-foreground">
                      Accessibility-First Scribe Platform
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Demo Role Switcher */}
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Demo as:</span>
                    <Button
                      size="sm"
                      variant={currentUser.role === 'blind_user' ? 'default' : 'outline'}
                      onClick={() => handleRoleSwitch('blind_user')}
                      data-testid="role-blind-user"
                    >
                      Student
                    </Button>
                    <Button
                      size="sm"
                      variant={currentUser.role === 'volunteer' ? 'default' : 'outline'}
                      onClick={() => handleRoleSwitch('volunteer')}
                      data-testid="role-volunteer"
                    >
                      Volunteer
                    </Button>
                    <Button
                      size="sm"
                      variant={currentUser.role === 'admin' ? 'default' : 'outline'}
                      onClick={() => handleRoleSwitch('admin')}
                      data-testid="role-admin"
                    >
                      Admin
                    </Button>
                  </div>
                  
                  <LanguageSelector />
                  <ThemeToggle />
                  
                  {/* User Profile */}
                  <div className="flex items-center gap-2 ml-2">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-xs"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </header>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto" data-testid="main-content">
                <AnimatePresence mode="wait">
                  <Router />
                </AnimatePresence>
              </main>
            </div>
          </div>
          
          {/* INSEE AI Assistant */}
          <InseeAssistant />
          
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
