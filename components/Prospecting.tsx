import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  FolderPlus, 
  Maximize, 
  Plus, 
  Building2,
  Crosshair,
  ChevronDown,
  Check,
  Star,
  Phone,
  Loader2,
  Globe,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { searchBusinesses } from '../services/placesService';
import { BusinessLead } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

// Data for the dropdowns
const BRAZIL_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
];

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  enableSearch?: boolean; // New prop to enable search functionality
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, disabled, isLoading, enableSearch = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search on close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, enableSearch]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-controls="select-dropdown"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-all
          ${disabled 
            ? 'cursor-not-allowed opacity-50 bg-[#161616] border-white/5 text-zinc-500' 
            : 'bg-[#161616] border-white/10 text-zinc-200 hover:bg-[#1c1c1c]'}
          focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]
          ${isOpen ? 'ring-2 ring-violet-600 ring-offset-2 ring-offset-[#0A0A0A] border-transparent' : ''}
        `}
      >
        <span className={`line-clamp-1 ${!selectedLabel ? 'text-zinc-500' : ''}`}>
          {isLoading ? 'Carregando cidades...' : (selectedLabel || placeholder)}
        </span>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50 text-zinc-400" />
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full overflow-hidden rounded-md border border-white/10 bg-[#161616] shadow-md animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Input Area */}
          {enableSearch && (
            <div className="p-2 border-b border-white/5 bg-[#161616] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`
                  relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors
                  ${option.value === value 
                    ? 'bg-violet-600 text-white' 
                    : 'text-zinc-300 hover:bg-violet-600 hover:text-white'}
                `}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
            {filteredOptions.length === 0 && (
               <div className="py-3 px-2 text-xs text-zinc-500 text-center">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Prospecting: React.FC = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityOptions, setCityOptions] = useState<Option[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [niche, setNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Fetch cities from IBGE API when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) {
        setCityOptions([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`);
        if (!response.ok) throw new Error('Falha ao buscar cidades');
        
        const data = await response.json();
        const formattedCities = data
          .map((city: { id: number; nome: string }) => ({
            value: city.nome,
            label: city.nome
          }))
          .sort((a: Option, b: Option) => a.label.localeCompare(b.label));

        setCityOptions(formattedCities);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        setCityOptions([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState]);

  // Initial Map Load
  useEffect(() => {
    const initMap = () => {
      if (window.google && mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 4,
          center: { lat: -14.2350, lng: -51.9253 }, // Brazil Center
          disableDefaultUI: true,
          backgroundColor: '#17191F',
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ],
        });
      }
    };

    // Attempt to load map immediately if script is ready, or wait a bit
    if (window.google) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initMap();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // Update Markers when leads change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || leads.length === 0) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    let processed = 0;

    leads.forEach((lead) => {
      // Create address string
      const fullAddress = `${lead.address}, ${selectedCity}, ${selectedState}, Brazil`;
      
      geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const marker = new window.google.maps.Marker({
            map: mapInstanceRef.current,
            position: results[0].geometry.location,
            title: lead.name,
            animation: window.google.maps.Animation.DROP,
          });
          
          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: black; padding: 8px; max-width: 220px;">
                <strong style="font-size: 14px;">${lead.name}</strong><br/>
                <div style="margin-top: 4px; font-size: 12px; color: #333;">${lead.address}</div>
                ${lead.phone ? `<div style="margin-top: 4px; font-size: 12px; font-weight: 500;">📞 ${lead.phone}</div>` : ''}
                ${lead.website ? `<div style="margin-top: 8px;"><a href="${lead.website}" target="_blank" style="display:inline-block; background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">🌐 Visitar Website</a></div>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
             infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(results[0].geometry.location);
        }
        
        processed++;
        // Fit bounds after processing all (approximate)
        if (processed === leads.length && markersRef.current.length > 0) {
           mapInstanceRef.current.fitBounds(bounds);
        }
      });
    });

  }, [leads, selectedCity, selectedState]);

  const handleSearch = async () => {
    if (!selectedState || !niche) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setLeads([]);
    
    // Default to state name if city not selected or generic
    const cityTerm = selectedCity || selectedState;
    const stateLabel = BRAZIL_STATES.find(s => s.value === selectedState)?.label || selectedState;
    
    try {
      const results = await searchBusinesses(stateLabel, cityTerm, niche);
      if (results.length === 0) {
        setError("Nenhum resultado encontrado para estes critérios.");
      }
      setLeads(results);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao buscar leads. Verifique sua conexão ou a chave de API.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveLead = (id: string) => {
    setLeads(current => 
      current.map(lead => 
        lead.id === id 
          ? { ...lead, status: lead.status === 'new' ? 'saved' : 'new' } 
          : lead
      )
    );
  };

  // Helper to extract domain from url
  const getDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'Website';
    }
  };
  
  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 pb-32 animate-fade-in-up">
      {/* Header */}
      <header className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Prospecção de Clientes</h1>
            <p className="text-zinc-500 text-sm">Busque negócios reais e salve como leads</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors">
            <FolderPlus size={16} />
            <span>Leads Salvas ({leads.filter(l => l.status === 'saved').length})</span>
          </button>
          <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium px-3 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
            <Search size={14} />
            <span>Ilimitado</span>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-12 gap-4 items-end">
          {/* State */}
          <div className="col-span-3">
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Estado <span className="text-red-500">*</span>
            </label>
            <CustomSelect 
              options={BRAZIL_STATES}
              value={selectedState}
              onChange={(val) => {
                setSelectedState(val);
                setSelectedCity(''); // Reset city when state changes
                setCityOptions([]); // Clear old cities
              }}
              placeholder="Selecione o estado"
            />
          </div>

          {/* City */}
          <div className="col-span-3">
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Cidade/Região <span className="text-red-500">*</span>
            </label>
            <CustomSelect 
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder={!selectedState ? "Selecione o estado primeiro" : "Selecione a cidade"}
              disabled={!selectedState || isLoadingCities}
              isLoading={isLoadingCities}
            />
          </div>

          {/* Niche */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Nicho do Negócio <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex: barbearia, academia, restaurante..."
              className="w-full h-10 bg-[#161616] border border-white/10 rounded-md py-2 px-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] transition-all"
            />
          </div>

          {/* Button */}
          <div className="col-span-2">
            <button 
              onClick={handleSearch}
              disabled={!selectedState || !selectedCity || !niche || isLoading}
              className={`
                w-full h-10 font-semibold rounded-md flex items-center justify-center gap-2 transition-all
                ${!selectedState || !selectedCity || !niche || isLoading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-white hover:bg-zinc-200 text-black'}
              `}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Crosshair size={18} />
                  <span>Buscar Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Error Banner */}
        {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-fade-in-up">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        {/* Map Area */}
        <div className="col-span-8 bg-[#0F1014] rounded-2xl border border-white/5 relative overflow-hidden group">
          {/* Map Container - always render, remove mock visual logic */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full bg-[#17191F]" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2 text-white font-medium bg-[#111]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-10">
            <MapPin size={16} />
            <span>Mapa</span>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={() => {
                 // Zoom to Brazil center
                 if(mapInstanceRef.current) {
                    mapInstanceRef.current.setZoom(4);
                    mapInstanceRef.current.setCenter({ lat: -14.2350, lng: -51.9253 });
                 }
              }}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-xl"
            >
              <Maximize size={20} className="text-black" />
            </button>
          </div>
           
           {/* Footer Credits */}
           <div className="absolute bottom-0 right-0 bg-[#111]/60 px-2 py-0.5 text-[10px] text-zinc-400 backdrop-blur-sm z-10">
              Map data ©2026 Google
           </div>
        </div>

        {/* Sidebar Results */}
        <div className="col-span-4 bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111]">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-zinc-400" />
              <h3 className="font-medium text-white text-sm">Resultados</h3>
            </div>
            {leads.length > 0 && (
              <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">
                {leads.length} encontrados
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                 <Loader2 className="animate-spin text-violet-500" size={32} />
                 <p className="text-zinc-500 text-sm">Consultando Google Maps Places...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                  <MapPin size={24} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 text-sm max-w-[200px]">
                  {hasSearched 
                    ? "Nenhum negócio encontrado nesta região ou ocorreu um erro." 
                    : 'Defina os filtros e clique em "Buscar Leads" para começar.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-sm leading-tight">{lead.name}</h4>
                      {lead.rating && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          <Star size={10} fill="currentColor" />
                          <span>{lead.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-zinc-500 text-xs mb-3 line-clamp-2">
                      {lead.address}
                    </p>

                    <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {lead.phone ? (
                          <div className="flex items-center gap-1 text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded">
                             <Phone size={10} />
                             <span>{lead.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 italic">Sem telefone</span>
                        )}
                        
                        {lead.website && (
                           <a 
                             href={lead.website}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/20 transition-all hover:scale-105"
                             title={lead.website}
                           >
                             <Globe size={10} />
                             <span className="max-w-[100px] truncate font-medium">{getDomain(lead.website)}</span>
                             <ExternalLink size={8} className="opacity-50" />
                           </a>
                        )}
                      </div>

                      <button 
                        onClick={() => toggleSaveLead(lead.id)}
                        className={`
                          flex items-center justify-center w-8 h-8 rounded-lg transition-all ml-auto
                          ${lead.status === 'saved' 
                            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'bg-white/5 text-zinc-400 hover:bg-white hover:text-black'}
                        `}
                      >
                        {lead.status === 'saved' ? <Check size={14} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};