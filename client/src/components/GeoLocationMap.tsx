import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTTS } from '@/hooks/use-tts';
import { SIMULATION_REQUESTS, SIMULATION_USERS, LOCATION_DATA } from '@/lib/simulation-data';
import { MapPin, Navigation, Users, Clock, Star, AlertCircle } from 'lucide-react';

// Simple map implementation without external dependencies
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'request' | 'volunteer' | 'user';
  title: string;
  description: string;
  data: any;
}

interface GeoLocationMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  showRequests?: boolean;
  showVolunteers?: boolean;
  selectedRequestId?: string;
  onRequestSelect?: (requestId: string) => void;
  className?: string;
}

export default function GeoLocationMap({
  center = LOCATION_DATA.defaultCenter,
  zoom = 12,
  showRequests = true,
  showVolunteers = true,
  selectedRequestId,
  onRequestSelect,
  className = ''
}: GeoLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

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
          tts.speak('Your location has been detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          tts.speak('Location access denied. Using default location.');
        }
      );
    }
  }, [tts]);

  // Generate markers
  useEffect(() => {
    const newMarkers: MapMarker[] = [];

    if (showRequests) {
      SIMULATION_REQUESTS.forEach(request => {
        newMarkers.push({
          id: `request-${request.id}`,
          lat: request.location.lat,
          lng: request.location.lng,
          type: 'request',
          title: request.title,
          description: `${request.subject} • ${request.examType}`,
          data: request
        });
      });
    }

    if (showVolunteers) {
      SIMULATION_USERS
        .filter(user => user.role === 'volunteer' && user.isActive)
        .forEach(volunteer => {
          newMarkers.push({
            id: `volunteer-${volunteer.id}`,
            lat: volunteer.location.lat,
            lng: volunteer.location.lng,
            type: 'volunteer',
            title: volunteer.name,
            description: `Reliability: ${volunteer.reliabilityScore}/5`,
            data: volunteer
          });
        });
    }

    if (userLocation) {
      newMarkers.push({
        id: 'user-location',
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: 'user',
        title: 'Your Location',
        description: 'Current position',
        data: { isUser: true }
      });
    }

    setMarkers(newMarkers);
  }, [showRequests, showVolunteers, userLocation]);

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

  // Convert lat/lng to pixel coordinates (simplified projection)
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    const x = ((lng - mapCenter.lng) / 0.01) * (mapWidth / 2) + mapWidth / 2;
    const y = ((mapCenter.lat - lat) / 0.01) * (mapHeight / 2) + mapHeight / 2;
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    if (marker.type === 'request' && onRequestSelect) {
      onRequestSelect(marker.data.id);
    }
    tts.speak(`${marker.title}. ${marker.description}`);
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'request': return 'bg-blue-500';
      case 'volunteer': return 'bg-green-500';
      case 'user': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'request': return <Clock className="w-3 h-3" />;
      case 'volunteer': return <Users className="w-3 h-3" />;
      case 'user': return <Navigation className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Location Map</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {markers.length} locations
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (userLocation) {
                setMapCenter(userLocation);
                tts.speak('Centered on your location');
              }
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            My Location
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMapCenter(LOCATION_DATA.defaultCenter);
              tts.speak('Reset to default view');
            }}
          >
            Reset View
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)' }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 10}%` }} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 10}%` }} />
              ))}
            </div>

            {/* Markers */}
            {mapRef.current && markers.map((marker) => {
              const { x, y } = latLngToPixel(
                marker.lat,
                marker.lng,
                mapRef.current!.clientWidth,
                mapRef.current!.clientHeight
              );

              return (
                <motion.div
                  key={marker.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute w-8 h-8 ${getMarkerColor(marker.type)} rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform ${
                    selectedMarker?.id === marker.id ? 'ring-4 ring-blue-300' : ''
                  }`}
                  style={{ left: x - 16, top: y - 16 }}
                  onClick={() => handleMarkerClick(marker)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getMarkerIcon(marker.type)}
                </motion.div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Volunteers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => {
                  setMapZoom(prev => Math.min(20, prev + 1));
                  tts.speak('Zoomed in');
                }}
              >
                +
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => {
                  setMapZoom(prev => Math.max(1, prev - 1));
                  tts.speak('Zoomed out');
                }}
              >
                -
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getMarkerIcon(selectedMarker.type)}
                {selectedMarker.title}
              </CardTitle>
              <CardDescription>{selectedMarker.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMarker.type === 'request' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedMarker.data.scheduledDate).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4" />
                    Difficulty: {selectedMarker.data.estimatedDifficulty}/5
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {selectedMarker.data.location.address}
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4" />
                      {Math.round(calculateDistance(
                        userLocation,
                        { lat: selectedMarker.data.location.lat, lng: selectedMarker.data.location.lng }
                      ) * 10) / 10} km away
                    </div>
                  )}
                </div>
              )}

              {selectedMarker.type === 'volunteer' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4" />
                    Reliability: {selectedMarker.data.reliabilityScore}/5
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    Languages: {selectedMarker.data.languages.join(', ')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {selectedMarker.data.location.address}
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4" />
                      {Math.round(calculateDistance(
                        userLocation,
                        { lat: selectedMarker.data.location.lat, lng: selectedMarker.data.location.lng }
                      ) * 10) / 10} km away
                    </div>
                  )}
                </div>
              )}

              {selectedMarker.type === 'user' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4" />
                    Your current location
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setMapCenter({ lat: selectedMarker.lat, lng: selectedMarker.lng });
                    tts.speak('Centered on selected location');
                  }}
                >
                  Center on Map
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMarker(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {markers.filter(m => m.type === 'request').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {markers.filter(m => m.type === 'volunteer').length}
            </div>
            <div className="text-sm text-muted-foreground">Available Volunteers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {SIMULATION_REQUESTS.filter(r => r.status === 'matched').length}
            </div>
            <div className="text-sm text-muted-foreground">Matched Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {SIMULATION_REQUESTS.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Sessions</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
