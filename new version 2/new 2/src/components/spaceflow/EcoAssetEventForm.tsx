import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Image as ImageIcon, 
  Users, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Upload, 
  Eye, 
  Info,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Common interface for Event creation
export interface EventFormValues {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  venueName: string;
  capacity: number;
  priceStandard: number;
  pricePremium: number;
  priceVip: number;
  imageBanner: string | null;
  imageThumbnail: string | null;
  speaker: string;
  partners: string[];
}

interface EcoAssetEventFormProps {
  onCancel: () => void;
  onSubmit: (values: EventFormValues) => void;
  initialValues?: Partial<EventFormValues>;
}

export const EcoAssetEventForm = ({ onCancel, onSubmit, initialValues }: EcoAssetEventFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<EventFormValues>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    category: initialValues?.category || 'Concerts',
    startDate: initialValues?.startDate || '2026-10-26T20:00',
    endDate: initialValues?.endDate || '2026-10-26T23:30',
    venueName: initialValues?.venueName || 'Arena E-Sport BizOS',
    capacity: initialValues?.capacity || 1500,
    priceStandard: initialValues?.priceStandard || 149,
    pricePremium: initialValues?.pricePremium || 249,
    priceVip: initialValues?.priceVip || 499,
    imageBanner: initialValues?.imageBanner || null,
    imageThumbnail: initialValues?.imageThumbnail || null,
    speaker: initialValues?.speaker || '',
    partners: initialValues?.partners || [],
  });

  const [partnerInput, setPartnerInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Validate the current step
  const validateStep = (step: number): boolean => {
    const stepErrors: string[] = [];
    if (step === 1) {
      if (!values.title.trim()) stepErrors.push("Le titre de l'événement est requis.");
      if (!values.description.trim()) stepErrors.push("Une description est requise.");
    } else if (step === 2) {
      if (!values.startDate) stepErrors.push("La date de début est requise.");
      if (!values.endDate) stepErrors.push("La date de fin est requise.");
      if (new Date(values.startDate) >= new Date(values.endDate)) {
        stepErrors.push("La date de fin doit être postérieure à la date de début.");
      }
      if (!values.venueName.trim()) stepErrors.push("Le lieu est requis.");
      if (values.capacity <= 0) stepErrors.push("La capacité doit être positive.");
    } else if (step === 3) {
      if (values.priceStandard < 0) stepErrors.push("Le prix standard ne peut pas être négatif.");
      if (values.pricePremium < values.priceStandard) {
        stepErrors.push("Le tarif Premium doit être supérieur ou égal au tarif Standard.");
      }
      if (values.priceVip < values.pricePremium) {
        stepErrors.push("Le tarif VIP doit être supérieur ou égal au tarif Premium.");
      }
    } else if (step === 5) {
      if (!values.speaker.trim()) stepErrors.push("L'intervenant principal ou artiste est requis.");
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors([]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrors([]);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(values);
    }
  };

  // Add a partner tag
  const handleAddPartner = () => {
    if (partnerInput.trim() && !values.partners.includes(partnerInput.trim())) {
      setValues(prev => ({
        ...prev,
        partners: [...prev.partners, partnerInput.trim()]
      }));
      setPartnerInput('');
    }
  };

  // Remove a partner tag
  const handleRemovePartner = (indexToRemove: number) => {
    setValues(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== indexToRemove)
    }));
  };

  const stepsList = [
    { id: 1, label: 'Général', icon: <FileText className="w-4 h-4" /> },
    { id: 2, label: 'Date & Lieu', icon: <Calendar className="w-4 h-4" /> },
    { id: 3, label: 'Billetterie', icon: <CreditCard className="w-4 h-4" /> },
    { id: 4, label: 'Médias', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 5, label: 'Intervenants', icon: <Users className="w-4 h-4" /> },
    { id: 6, label: 'Révision', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-[#0a0c1a]/95 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative font-sans text-white">
      
      {/* Background glass glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          Création d'Événement BizOS
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configurez votre nouvel événement étape par étape avec notre éditeur intuitif haut de gamme.</p>
      </div>

      {/* Horizontal Progress bar */}
      <div className="flex justify-between items-center mb-8 gap-2 overflow-x-auto pb-4 scrollbar-thin">
        {stepsList.map(step => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  // Allow clicking previous or validated steps
                  if (isCompleted || step.id < currentStep) {
                    setCurrentStep(step.id);
                    setErrors([]);
                  }
                }}
                disabled={step.id > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-bold transition-all ${
                  isActive 
                    ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                    : isCompleted
                    ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCompleted ? 'bg-emerald-500 text-slate-950' : isActive ? 'bg-purple-500 text-white' : 'bg-slate-800'
                }`}>
                  {isCompleted ? '✓' : step.id}
                </div>
                <span>{step.label}</span>
              </button>
              
              {step.id < 6 && (
                <div className={`w-4 h-[1px] md:w-8 shrink-0 ${isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Errors Banner */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Veuillez corriger les erreurs suivantes :</span>
          </div>
          {errors.map((err, idx) => (
            <div key={idx} className="list-item ml-4">{err}</div>
          ))}
        </div>
      )}

      {/* Active step contents wrapper with animation */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl min-h-[280px]"
          >
            
            {/* STEP 1: GENERAL INFO */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 1 sur 6 : Informations Générales</span>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Titre de l'Événement</label>
                    <input
                      type="text"
                      value={values.title}
                      onChange={(e) => setValues({ ...values, title: e.target.value })}
                      placeholder="ex: Grande Finale de l'Arène eSport 2026"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Catégorie</label>
                    <select
                      value={values.category}
                      onChange={(e) => setValues({ ...values, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Concerts">Concerts</option>
                      <option value="Conferences">Conférences</option>
                      <option value="Festivals">Festivals</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Other">Autres</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Description de l'Événement</label>
                    <textarea
                      value={values.description}
                      onChange={(e) => setValues({ ...values, description: e.target.value })}
                      placeholder="Décrivez l'événement, les règles, le programme et ce que comprend la billetterie..."
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & VENUE */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 2 sur 6 : Date et Localisation</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Date et Heure de Début</label>
                    <input
                      type="datetime-local"
                      value={values.startDate}
                      onChange={(e) => setValues({ ...values, startDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Date et Heure de Fin</label>
                    <input
                      type="datetime-local"
                      value={values.endDate}
                      onChange={(e) => setValues({ ...values, endDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Lieu / Stadium / Salle</label>
                    <select
                      value={values.venueName}
                      onChange={(e) => setValues({ ...values, venueName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Arena E-Sport BizOS">Arena E-Sport BizOS (1 500 places)</option>
                      <option value="Stade BizOS">Stade BizOS (80 000 places)</option>
                      <option value="Opéra Garnier BizOS">Opéra Garnier BizOS (1 900 places)</option>
                      <option value="Centre de Conférence BizOS">Centre de Conférence BizOS (12 000 places)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Capacité de la salle (Spécifique)</label>
                    <input
                      type="number"
                      value={values.capacity}
                      onChange={(e) => setValues({ ...values, capacity: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TICKETING & TIERS */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 3 sur 6 : Billetterie &amp; Tarifications</span>
                
                <p className="text-[11px] text-slate-400 bg-blue-950/20 p-3 rounded-xl border border-blue-800/20 flex gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Configurez les tarifs pour les 3 catégories d'accréditations supportées par notre moteur de placement dynamique.</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Standard */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-300">🎟 Standard</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">Cat. 3</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={values.priceStandard}
                        onChange={(e) => setValues({ ...values, priceStandard: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-purple-300">🌟 Premium</span>
                      <span className="text-[10px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded font-bold">Cat. 2</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={values.pricePremium}
                        onChange={(e) => setValues({ ...values, pricePremium: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* VIP */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-amber-300">👑 VIP Gold</span>
                      <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold">Cat. 1</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={values.priceVip}
                        onChange={(e) => setValues({ ...values, priceVip: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: MEDIA & COMMUNICATION */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 4 sur 6 : Médias de Communication</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Banner */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Bannière de l'Événement (Large, 16:9)</label>
                    <div className="border border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-950/40 min-h-[140px] relative overflow-hidden group">
                      {values.imageBanner ? (
                        <>
                          <img src={values.imageBanner} alt="Bannière" className="absolute inset-0 w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setValues({ ...values, imageBanner: null })}
                            className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                          <div>
                            <button 
                              type="button" 
                              onClick={() => setValues({ ...values, imageBanner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' })}
                              className="text-xs text-purple-400 font-semibold hover:underline"
                            >
                              Générer une image par défaut
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-600 block">Fichier PNG/JPG, max 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Vignette de l'Événement (Affiche, 4:3)</label>
                    <div className="border border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-950/40 min-h-[140px] relative overflow-hidden group">
                      {values.imageThumbnail ? (
                        <>
                          <img src={values.imageThumbnail} alt="Affiche" className="absolute inset-0 w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setValues({ ...values, imageThumbnail: null })}
                            className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                          <div>
                            <button 
                              type="button" 
                              onClick={() => setValues({ ...values, imageThumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400' })}
                              className="text-xs text-purple-400 font-semibold hover:underline"
                            >
                              Générer une image par défaut
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-600 block">Fichier PNG/JPG, max 2MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SPEAKERS & PARTNERS */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 5 sur 6 : Intervenants, Invités &amp; Partenaires</span>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Artiste principal / Conférencier clé</label>
                    <input
                      type="text"
                      value={values.speaker}
                      onChange={(e) => setValues({ ...values, speaker: e.target.value })}
                      placeholder="ex: David Guetta, Elon Musk, Dr. Alan Grant"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Partners tags */}
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Partenaires officiels / Sponsors</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={partnerInput}
                        onChange={(e) => setPartnerInput(e.target.value)}
                        placeholder="ex: Google Cloud, BizOS Suite"
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPartner}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Ajouter
                      </button>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      {values.partners.length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic">Aucun partenaire enregistré.</span>
                      ) : (
                        values.partners.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 select-none"
                          >
                            <span>{tag}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemovePartner(idx)}
                              className="text-slate-500 hover:text-slate-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & CONFIRM */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <span className="text-purple-400 font-mono text-[10px] uppercase font-bold tracking-widest block">Étape 6 sur 6 : Récapitulatif et validation</span>
                
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-4 text-xs">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Titre de l'événement</span>
                      <h4 className="text-sm font-extrabold text-white">{values.title}</h4>
                    </div>
                    <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-900 px-2.5 py-1 rounded-full font-bold uppercase">{values.category}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Date & Lieu</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{new Date(values.startDate).toLocaleDateString()} de {new Date(values.startDate).toLocaleTimeString()} à {new Date(values.endDate).toLocaleTimeString()}</p>
                      <p className="text-slate-400">{values.venueName}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Invité clé / Artiste</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{values.speaker}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-3">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Tarif Standard</span>
                      <span className="font-bold text-slate-300 font-mono text-xs">{values.priceStandard} €</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-purple-400 block">Tarif Premium</span>
                      <span className="font-bold text-purple-300 font-mono text-xs">{values.pricePremium} €</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-amber-400 block">Tarif VIP Gold</span>
                      <span className="font-bold text-amber-300 font-mono text-xs">{values.priceVip} €</span>
                    </div>
                  </div>

                  {values.partners.length > 0 && (
                    <div className="border-t border-slate-800 pt-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Partenaires sponsors</span>
                      <p className="text-slate-300">{values.partners.join(', ')}</p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 italic text-center">
                  Veuillez vérifier toutes les informations avant de cliquer sur valider pour indexer l'événement dans la billetterie active.
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Action controls */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Annuler
          </button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all"
              >
                Créer l'Événement <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};
