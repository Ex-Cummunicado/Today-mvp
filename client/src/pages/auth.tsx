import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useTTS } from '@/hooks/use-tts';
import { SIMULATION_USERS, ANIMATIONS } from '@/lib/simulation-data';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Languages, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthFormData {
  name: string;
  email: string;
  phoneNumber: string;
  role: 'blind_user' | 'volunteer' | 'admin';
  password: string;
  confirmPassword: string;
  location: {
    city: string;
    state: string;
  };
  languages: string[];
  preferences: {
    preferredLanguage: string;
    contrastMode: 'low' | 'medium' | 'high';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  terms: boolean;
}

const initialFormData: AuthFormData = {
  name: '',
  email: '',
  phoneNumber: '',
  role: 'blind_user',
  password: '',
  confirmPassword: '',
  location: {
    city: '',
    state: ''
  },
  languages: ['English'],
  preferences: {
    preferredLanguage: 'English',
    contrastMode: 'medium',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  },
  terms: false
};

export default function AuthPage() {
  const [formData, setFormData] = useState<AuthFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});

  const tts = useTTS({ enabled: true });

  // Auto-announce page content
  useEffect(() => {
    const pageDescription = "Welcome to InscribeMate. Please sign in or create an account to access the accessibility-first scribe platform.";
    tts.speak(pageDescription);
  }, [tts]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.location.city.trim()) {
      newErrors.location = { ...newErrors.location, city: 'City is required' };
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AuthFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNestedInputChange = (parentField: keyof AuthFormData, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value
      }
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a simple user based on email input
    const user = {
      id: 'demo-user',
      name: formData.email.split('@')[0] || 'Demo User',
      email: formData.email,
      role: formData.role,
      avatar: (formData.email.split('@')[0] || 'DU').substring(0, 2).toUpperCase()
    };

    // Store user in localStorage
    localStorage.setItem('inscribemate_user', JSON.stringify(user));
    
    toast.success(`Welcome, ${user.name}!`);
    tts.speak(`Welcome, ${user.name}! Redirecting to dashboard.`);
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      tts.speak('Please fix the errors in the form before continuing.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success(`Account created successfully! Welcome, ${formData.name}!`);
    tts.speak(`Account created successfully! Welcome, ${formData.name}! Redirecting to dashboard.`);
    
    // Simulate redirect
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

    setIsLoading(false);
  };

  const steps = [
    { title: 'Basic Info', description: 'Name, email, and role' },
    { title: 'Contact', description: 'Phone and location' },
    { title: 'Preferences', description: 'Languages and settings' },
    { title: 'Review', description: 'Confirm your details' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      tts.speak(`Step ${currentStep + 2}: ${steps[currentStep + 1].title}. ${steps[currentStep + 1].description}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      tts.speak(`Step ${currentStep}: ${steps[currentStep - 1].title}. ${steps[currentStep - 1].description}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">Welcome to InscribeMate</CardTitle>
              <CardDescription className="text-lg mt-2">
                Accessibility-First Scribe Platform
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin" onClick={() => tts.speak('Sign in tab selected')}>
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => tts.speak('Sign up tab selected')}>
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <motion.form
                  onSubmit={handleSignIn}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email or Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="text"
                          placeholder="Enter any email or username"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                          onFocus={() => tts.speak('Email field selected')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signin-role">I want to sign in as:</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => {
                          handleInputChange('role', value);
                          tts.speak(`Role selected: ${value.replace('_', ' ')}`);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blind_user">Student (Need Assistance)</SelectItem>
                          <SelectItem value="volunteer">Volunteer (Provide Assistance)</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !formData.email.trim()}
                    onClick={() => tts.speak('Sign in button clicked')}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Just enter any email and choose your role!
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'student@demo.com', role: 'blind_user' }));
                          tts.speak('Demo student account selected');
                        }}
                      >
                        Student Demo
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'volunteer@demo.com', role: 'volunteer' }));
                          tts.speak('Demo volunteer account selected');
                        }}
                      >
                        Volunteer Demo
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'admin@demo.com', role: 'admin' }));
                          tts.speak('Demo admin account selected');
                        }}
                      >
                        Admin Demo
                      </Badge>
                    </div>
                  </div>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              index <= currentStep
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="ml-2 hidden sm:block">
                            <p className="text-sm font-medium">{step.title}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-4 ${
                              index < currentStep ? 'bg-primary' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Content */}
                  <form onSubmit={handleSignUp} className="space-y-6">
                    {currentStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            onFocus={() => tts.speak('Name field selected')}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive flex items-center mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Enter your email"
                              className="pl-10"
                              onFocus={() => tts.speak('Email field selected')}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-destructive flex items-center mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) => {
                              handleInputChange('role', value);
                              tts.speak(`Role selected: ${value.replace('_', ' ')}`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blind_user">Student (Need Assistance)</SelectItem>
                              <SelectItem value="volunteer">Volunteer (Provide Assistance)</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                              placeholder="Enter your phone number"
                              className="pl-10"
                              onFocus={() => tts.speak('Phone number field selected')}
                            />
                          </div>
                          {errors.phoneNumber && (
                            <p className="text-sm text-destructive flex items-center mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.phoneNumber}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="city"
                                value={formData.location.city}
                                onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                                placeholder="City"
                                className="pl-10"
                                onFocus={() => tts.speak('City field selected')}
                              />
                            </div>
                            {errors.location?.city && (
                              <p className="text-sm text-destructive flex items-center mt-1">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.location.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={formData.location.state}
                              onChange={(e) => handleNestedInputChange('location', 'state', e.target.value)}
                              placeholder="State"
                              onFocus={() => tts.speak('State field selected')}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label>Languages</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'German'].map(lang => (
                              <Badge
                                key={lang}
                                variant={formData.languages.includes(lang) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newLanguages = formData.languages.includes(lang)
                                    ? formData.languages.filter(l => l !== lang)
                                    : [...formData.languages, lang];
                                  handleInputChange('languages', newLanguages);
                                  tts.speak(`${lang} ${formData.languages.includes(lang) ? 'removed' : 'added'}`);
                                }}
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="preferredLanguage">Preferred Language</Label>
                          <Select
                            value={formData.preferences.preferredLanguage}
                            onValueChange={(value) => {
                              handleNestedInputChange('preferences', 'preferredLanguage', value);
                              tts.speak(`Preferred language set to: ${value}`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.languages.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="contrastMode">Contrast Mode</Label>
                          <Select
                            value={formData.preferences.contrastMode}
                            onValueChange={(value) => {
                              handleNestedInputChange('preferences', 'contrastMode', value);
                              tts.speak(`Contrast mode set to: ${value}`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Notification Preferences</Label>
                          <div className="space-y-2 mt-2">
                            {Object.entries(formData.preferences.notifications).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={key}
                                  checked={value}
                                  onCheckedChange={(checked) => {
                                    handleNestedInputChange('preferences', 'notifications', {
                                      ...formData.preferences.notifications,
                                      [key]: checked
                                    });
                                    tts.speak(`${key} notifications ${checked ? 'enabled' : 'disabled'}`);
                                  }}
                                />
                                <Label htmlFor={key} className="capitalize">
                                  {key} notifications
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Create a password"
                              className="pr-10"
                              onFocus={() => tts.speak('Password field selected')}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => {
                                setShowPassword(!showPassword);
                                tts.speak(showPassword ? 'Password hidden' : 'Password visible');
                              }}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-destructive flex items-center mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            onFocus={() => tts.speak('Confirm password field selected')}
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-destructive flex items-center mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={formData.terms}
                            onCheckedChange={(checked) => {
                              handleInputChange('terms', checked);
                              tts.speak(`Terms and conditions ${checked ? 'accepted' : 'not accepted'}`);
                            }}
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I agree to the{' '}
                            <a href="#" className="text-primary hover:underline">
                              Terms and Conditions
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary hover:underline">
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        {errors.terms && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.terms}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>

                      {currentStep < steps.length - 1 ? (
                        <Button type="button" onClick={nextStep}>
                          Next
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
