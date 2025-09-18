import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTTS } from '@/hooks/use-tts';
import { 
  SIMULATION_REQUESTS, 
  SIMULATION_USERS, 
  SIMULATION_APPLICATIONS,
  SEARCH_FILTERS,
  LOCATION_DATA,
  ANIMATIONS
} from '@/lib/simulation-data';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter, 
  X, 
  Navigation,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Languages
} from 'lucide-react';

interface SearchFilters {
  query: string;
  subject: string;
  examType: string;
  urgency: string;
  status: string;
  difficulty: number[];
  radius: number;
  languages: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

const initialFilters: SearchFilters = {
  query: '',
  subject: '',
  examType: '',
  urgency: '',
  status: '',
  difficulty: [1, 5],
  radius: 25,
  languages: [],
  dateRange: {
    start: '',
    end: ''
  }
};

export default function SearchAndMatchmaking() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(LOCATION_DATA.defaultCenter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const tts = useTTS({ enabled: true });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          tts.speak('Your location has been detected for better matching');
        },
        (error) => {
          console.error('Error getting location:', error);
          tts.speak('Location access denied. Using default location for matching.');
        }
      );
    }
  }, [tts]);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return SIMULATION_REQUESTS.filter(request => {
      // Text search
      if (filters.query && !request.title.toLowerCase().includes(filters.query.toLowerCase()) &&
          !request.description.toLowerCase().includes(filters.query.toLowerCase()) &&
          !request.subject.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }

      // Subject filter
      if (filters.subject && request.subject !== filters.subject) {
        return false;
      }

      // Exam type filter
      if (filters.examType && request.examType !== filters.examType) {
        return false;
      }

      // Urgency filter
      if (filters.urgency && request.urgency !== filters.urgency) {
        return false;
      }

      // Status filter
      if (filters.status && request.status !== filters.status) {
        return false;
      }

      // Difficulty filter
      if (request.estimatedDifficulty < filters.difficulty[0] || 
          request.estimatedDifficulty > filters.difficulty[1]) {
        return false;
      }

      // Language filter
      if (filters.languages.length > 0) {
        const requestLanguages = request.user.languages || [];
        if (!filters.languages.some(lang => requestLanguages.includes(lang))) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start && new Date(request.scheduledDate) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(request.scheduledDate) > new Date(filters.dateRange.end)) {
        return false;
      }

      // Distance filter (if user location is available)
      if (userLocation && filters.radius < 100) {
        const distance = calculateDistance(
          userLocation,
          { lat: request.location.lat, lng: request.location.lng }
        );
        if (distance > filters.radius) {
          return false;
        }
      }

      return true;
    });
  }, [filters, userLocation]);

  // Calculate distance between two points
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get matchmaking data for selected request
  const matchmakingData = useMemo(() => {
    if (!selectedRequest) return null;

    const request = SIMULATION_REQUESTS.find(r => r.id === selectedRequest);
    if (!request) return null;

    const applications = SIMULATION_APPLICATIONS.filter(app => app.requestId === selectedRequest);
    const volunteers = SIMULATION_USERS.filter(user => user.role === 'volunteer');

    // Calculate match scores for all volunteers
    const matches = volunteers.map(volunteer => {
      let score = 50; // Base score

      // Language matching
      const commonLanguages = volunteer.languages.filter(lang => 
        request.user.languages.includes(lang)
      );
      score += commonLanguages.length * 15;

      // Location proximity
      const distance = calculateDistance(
        { lat: request.location.lat, lng: request.location.lng },
        { lat: volunteer.location.lat, lng: volunteer.location.lng }
      );
      if (distance < 10) score += 20;
      else if (distance < 25) score += 15;
      else if (distance < 50) score += 10;

      // Reliability score
      score += volunteer.reliabilityScore * 4;

      // Availability check
      const requestDate = new Date(request.scheduledDate);
      const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const volunteerAvailability = volunteer.availability?.[dayOfWeek];
      if (volunteerAvailability && Array.isArray(volunteerAvailability)) {
        score += 10; // Available on that day
      }

      // Specialization matching
      if (volunteer.preferences?.specializations?.includes(request.subject)) {
        score += 15;
      }

      return {
        volunteer,
        score: Math.min(100, Math.max(0, score)),
        distance: Math.round(distance * 10) / 10,
        application: applications.find(app => app.volunteerId === volunteer.id)
      };
    }).sort((a, b) => b.score - a.score);

    return {
      request,
      matches,
      applications
    };
  }, [selectedRequest]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedFilterChange = (parentKey: keyof SearchFilters, childKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    tts.speak('All filters cleared');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'matched': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Search & Matchmaking</h2>
            <p className="text-muted-foreground">
              Find scribe requests and match with volunteers
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowFilters(!showFilters);
              tts.speak(showFilters ? 'Filters hidden' : 'Filters shown');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests by title, description, or subject..."
            value={filters.query}
            onChange={(e) => {
              handleFilterChange('query', e.target.value);
              tts.speak(`Searching for: ${e.target.value}`);
            }}
            className="pl-10"
            onFocus={() => tts.speak('Search field selected')}
          />
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Select
                      value={filters.subject}
                      onValueChange={(value) => {
                        handleFilterChange('subject', value);
                        tts.speak(`Subject filter: ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All subjects</SelectItem>
                        {SEARCH_FILTERS.subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Exam Type</label>
                    <Select
                      value={filters.examType}
                      onValueChange={(value) => {
                        handleFilterChange('examType', value);
                        tts.speak(`Exam type filter: ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        {SEARCH_FILTERS.examTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Urgency</label>
                    <Select
                      value={filters.urgency}
                      onValueChange={(value) => {
                        handleFilterChange('urgency', value);
                        tts.speak(`Urgency filter: ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All urgency levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All urgency levels</SelectItem>
                        {SEARCH_FILTERS.urgencyLevels.map(urgency => (
                          <SelectItem key={urgency} value={urgency}>
                            {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => {
                        handleFilterChange('status', value);
                        tts.speak(`Status filter: ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        {SEARCH_FILTERS.statuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Difficulty: {filters.difficulty[0]} - {filters.difficulty[1]}
                    </label>
                    <Slider
                      value={filters.difficulty}
                      onValueChange={(value) => {
                        handleFilterChange('difficulty', value);
                        tts.speak(`Difficulty range: ${value[0]} to ${value[1]}`);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Radius: {filters.radius} km
                    </label>
                    <Slider
                      value={[filters.radius]}
                      onValueChange={(value) => {
                        handleFilterChange('radius', value[0]);
                        tts.speak(`Search radius: ${value[0]} kilometers`);
                      }}
                      min={1}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium mb-2 block">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {SEARCH_FILTERS.languages.map(lang => (
                        <Badge
                          key={lang}
                          variant={filters.languages.includes(lang) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newLanguages = filters.languages.includes(lang)
                              ? filters.languages.filter(l => l !== lang)
                              : [...filters.languages, lang];
                            handleFilterChange('languages', newLanguages);
                            tts.speak(`${lang} ${filters.languages.includes(lang) ? 'removed' : 'added'}`);
                          }}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Requests ({filteredRequests.length})
            </h3>
            {userLocation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Location enabled
              </Badge>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRequest === request.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedRequest(request.id);
                      tts.speak(`Selected request: ${request.title}`);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">{request.subject}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {request.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.location.address}
                        </div>
                        {userLocation && (
                          <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {Math.round(calculateDistance(
                              userLocation,
                              { lat: request.location.lat, lng: request.location.lng }
                            ) * 10) / 10} km
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span className="text-xs">Difficulty: {request.estimatedDifficulty}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          <span className="text-xs">{request.user.languages.join(', ')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredRequests.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests found matching your criteria</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
                  Clear filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Matchmaking Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Matchmaking</h3>
          
          {selectedRequest && matchmakingData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{matchmakingData.request.title}</CardTitle>
                  <CardDescription>
                    {matchmakingData.request.subject} • {matchmakingData.request.examType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      {matchmakingData.request.location.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(matchmakingData.request.scheduledDate).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {matchmakingData.request.duration} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Top Matches</h4>
                {matchmakingData.matches.slice(0, 5).map((match, index) => (
                  <motion.div
                    key={match.volunteer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${match.application ? 'ring-2 ring-blue-200' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium">{match.volunteer.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {match.volunteer.preferences?.specializations?.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {match.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {match.distance} km away
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {match.volunteer.reliabilityScore}/5
                          </div>
                          <div className="flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {match.volunteer.languages.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {match.volunteer.phoneNumber}
                          </div>
                        </div>

                        {match.application ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Applied
                            </Badge>
                            <Badge className={getStatusColor(match.application.status)}>
                              {match.application.status}
                            </Badge>
                          </div>
                        ) : (
                          <Button size="sm" className="w-full">
                            Apply as Volunteer
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a request to see matchmaking results</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
