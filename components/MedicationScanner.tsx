import React, { useState, useRef } from 'react';
import { Pill, Search, ShieldCheck, AlertCircle, Loader2, Camera, X } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { getMedicationInfo, identifyMedicationFromImage } from '../services/geminiService';
import { t } from '../translations';

interface MedicationScannerProps {
  language: SupportedLanguage;
}

export const MedicationScanner: React.FC<MedicationScannerProps> = ({ language }) => {
  const lang = language.code;
  const isTa = lang === 'ta';

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const popularMeds = [
    { name: 'Paracetamol / Acetaminophen', use: isTa ? 'காய்ச்சல் & லேசான வலி நிவாரணி' : 'Fever & Mild Pain Relief' },
    { name: 'ORS (Oral Rehydration Salts)', use: isTa ? 'வயிற்றுப்போக்கு & நீர்ச்சத்து இழப்பு' : 'Diarrhea & Dehydration' },
    { name: 'Amoxicillin', use: isTa ? 'பாக்டீரியா தொற்று (ஆன்டிபயாடிக்)' : 'Bacterial Infection (Antibiotic)' },
    { name: 'Cetirizine', use: isTa ? 'ஒவ்வாமை, சளி & அரிப்பு' : 'Allergy, Cold & Itching' },
    { name: 'Metformin', use: isTa ? 'டைப் 2 நீரிழிவு கட்டுப்பாடு' : 'Type 2 Diabetes Control' },
    { name: 'Antacid / Gelusil', use: isTa ? 'அமிலத்தன்மை & நெஞ்செரிச்சல்' : 'Acidity & Heartburn' },
  ];

  const handleSearch = async (medicineName: string) => {
    if (!medicineName.trim()) return;
    setQuery(medicineName);
    setLoading(true);
    setResult(null);
    setCapturedImage(null);

    try {
      const info = await getMedicationInfo(medicineName, language.name);
      setResult(info);
    } catch (e: any) {
      console.error(e);
      setResult(isTa ? 'மருந்து தகவலை மீட்டெடுக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to retrieve medication info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraLoading(true);
    setResult(null);
    setQuery('');

    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';

      try {
        const info = await identifyMedicationFromImage(base64, mimeType, language.name);
        setResult(info);
        setQuery(isTa ? 'படத்திலிருந்து கண்டறியப்பட்டது' : 'Identified from photo');
      } catch (err: any) {
        setResult(isTa
          ? 'படத்திலிருந்து மருந்தை கண்டுபிடிக்க முடியவில்லை. தெளிவான படத்தை எடுக்கவும்.'
          : err.message || 'Could not identify medication from this image. Try a clearer photo.');
      } finally {
        setCameraLoading(false);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t(lang, 'med.title')}
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {t(lang, 'med.subtitle')}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-2">
        <div className="p-3 text-slate-400">
          <Pill size={22} className="text-emerald-600" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={t(lang, 'med.placeholder')}
          className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={!query.trim() || loading || cameraLoading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 shrink-0 min-h-[44px]"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span>{t(lang, 'med.search')}</span>
        </button>
      </div>

      {/* Camera Scan Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
          id="pill-camera"
        />
        <label
          htmlFor="pill-camera"
          className={`flex items-center justify-center space-x-2 w-full py-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-sm font-bold ${
            cameraLoading
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
          }`}
        >
          {cameraLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{isTa ? 'AI மருந்தை கண்டுபிடிக்கிறது...' : 'AI identifying medication...'}</span>
            </>
          ) : (
            <>
              <Camera size={18} />
              <span>{isTa ? '📷 மருந்து பட்டியை புகைப்படம் எடுக்கவும்' : '📷 Scan Pill Strip / Box with Camera'}</span>
            </>
          )}
        </label>
        <p className="text-[10px] text-slate-400 text-center mt-1">
          {isTa
            ? 'மாத்திரை பட்டி அல்லது மருந்து பெட்டியின் படம் எடுக்கவும் — Gemini AI கண்டுபிடிக்கும்'
            : 'Take a photo of the pill strip or medicine box — Gemini AI will identify it'}
        </p>
      </div>

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured pill"
            className="w-full max-h-48 object-contain rounded-2xl border border-slate-200 bg-slate-100"
          />
          <button
            onClick={() => { setCapturedImage(null); setResult(null); }}
            className="absolute top-2 right-2 bg-slate-800/60 hover:bg-slate-800/80 text-white rounded-full p-1.5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Popular Community Medicines Chips */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t(lang, 'med.common')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {popularMeds.map((med) => (
            <button
              key={med.name}
              onClick={() => handleSearch(med.name)}
              className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 p-3.5 rounded-2xl text-left transition-all group flex flex-col justify-between shadow-sm"
            >
              <span className="font-bold text-slate-800 text-xs group-hover:text-emerald-700 transition-colors">
                {med.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">
                {med.use}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <ShieldCheck size={20} />
              <span>{isTa ? 'மருத்துவ தகவல் வழிகாட்டி' : 'Medical Information Guide'}</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase">
              {capturedImage ? (isTa ? 'படம் மூலம்' : 'Via Photo') : (isTa ? 'சரிபார்க்கப்பட்டது' : 'Verified')}
            </span>
          </div>

          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}

      {/* Medical Safety Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-amber-800 text-xs leading-relaxed font-medium">
        <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <p>{t(lang, 'med.disclaimer')}</p>
      </div>
    </div>
  );
};

export default MedicationScanner;
