import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, HealthJournalEntry } from '../types';
import { addJournalEntry, subscribeToJournal, getAnonymousUserId, interpretBP, interpretBloodSugar } from '../services/healthJournalService';
import { BookHeart, Plus, Thermometer, Droplets, Heart, Activity, TrendingUp, X, Save, ChevronDown, ChevronUp } from 'lucide-react';

interface HealthJournalProps {
  language: SupportedLanguage;
}

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = (): Partial<HealthJournalEntry> => ({
  date: today(),
  systolic: undefined,
  diastolic: undefined,
  bloodSugar: undefined,
  temperature: undefined,
  weight: undefined,
  spO2: undefined,
  symptoms: '',
  notes: '',
});

const HealthJournal: React.FC<HealthJournalProps> = ({ language }) => {
  const lang = language.code;
  const isTa = lang === 'ta';
  const userId = useRef(getAnonymousUserId()).current;

  const [entries, setEntries] = useState<HealthJournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<HealthJournalEntry>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToJournal(userId, setEntries);
    return unsub;
  }, [userId]);

  const handleSave = async () => {
    if (!form.date) return;
    setSaving(true);
    try {
      await addJournalEntry({
        userId,
        date: form.date!,
        systolic: form.systolic,
        diastolic: form.diastolic,
        bloodSugar: form.bloodSugar,
        temperature: form.temperature,
        weight: form.weight,
        spO2: form.spO2,
        symptoms: form.symptoms || '',
        notes: form.notes || '',
      });
      setForm(emptyForm());
      setShowForm(false);
      setSuccessMsg(isTa ? 'பதிவு சேமிக்கப்பட்டது ✓' : 'Entry saved ✓');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Journal save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof HealthJournalEntry, value: any) =>
    setForm(prev => ({ ...prev, [key]: value === '' ? undefined : value }));

  const numInput = (key: keyof HealthJournalEntry, placeholder: string, step = 1) => (
    <input
      type="number"
      step={step}
      placeholder={placeholder}
      value={(form as any)[key] ?? ''}
      onChange={e => set(key, parseFloat(e.target.value))}
      className="form-input text-sm"
    />
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <BookHeart size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                {isTa ? 'சுகாதார நாட்குறிப்பு' : 'Health Journal'}
              </h1>
              <p className="text-teal-200 text-xs">
                {isTa ? 'உங்கள் ஆரோக்கிய பதிவுகளை கண்காணியுங்கள்' : 'Track your health vitals over time'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(emptyForm()); }}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? (isTa ? 'மூடு' : 'Close') : (isTa ? 'புதிய பதிவு' : 'New Entry')}</span>
          </button>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-center animate-in">
          {successMsg}
        </div>
      )}

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-teal-100 animate-in">
          <h2 className="text-sm font-bold text-slate-700 mb-3">
            {isTa ? 'புதிய பதிவு சேர்க்கவும்' : 'Add New Health Entry'}
          </h2>

          <div className="space-y-3">
            {/* Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isTa ? 'தேதி' : 'Date'}
              </label>
              <input
                type="date"
                max={today()}
                value={form.date || today()}
                onChange={e => set('date', e.target.value)}
                className="form-input mt-1"
              />
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Heart size={11} className="text-rose-400" />
                <span>{isTa ? 'இரத்த அழுத்தம் (mmHg)' : 'Blood Pressure (mmHg)'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="number"
                  placeholder={isTa ? 'மேல் அழுத்தம் (Sys)' : 'Systolic'}
                  value={form.systolic ?? ''}
                  onChange={e => set('systolic', parseFloat(e.target.value))}
                  className="form-input text-sm"
                />
                <input
                  type="number"
                  placeholder={isTa ? 'கீழ் அழுத்தம் (Dia)' : 'Diastolic'}
                  value={form.diastolic ?? ''}
                  onChange={e => set('diastolic', parseFloat(e.target.value))}
                  className="form-input text-sm"
                />
              </div>
              {form.systolic && form.diastolic && (() => {
                const bp = interpretBP(form.systolic!, form.diastolic!);
                return <p className={`text-xs mt-1 font-semibold ${bp.color}`}>{bp.label}</p>;
              })()}
            </div>

            {/* Blood Sugar */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Droplets size={11} className="text-amber-400" />
                <span>{isTa ? 'இரத்த சர்க்கரை (mg/dL)' : 'Blood Sugar (mg/dL)'}</span>
              </label>
              <div className="mt-1">
                {numInput('bloodSugar', 'e.g. 95')}
                {form.bloodSugar && (() => {
                  const bs = interpretBloodSugar(form.bloodSugar!);
                  return <p className={`text-xs mt-1 font-semibold ${bs.color}`}>{bs.label}</p>;
                })()}
              </div>
            </div>

            {/* Temperature + Weight + SpO2 */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Thermometer size={10} />
                  <span>{isTa ? 'வெப்பம் °C' : 'Temp °C'}</span>
                </label>
                <input type="number" step="0.1" placeholder="37.0" value={form.temperature ?? ''} onChange={e => set('temperature', parseFloat(e.target.value))} className="form-input text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isTa ? 'எடை கிலோ' : 'Weight kg'}
                </label>
                <input type="number" step="0.5" placeholder="65" value={form.weight ?? ''} onChange={e => set('weight', parseFloat(e.target.value))} className="form-input text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SpO2 %</label>
                <input type="number" step="1" min="80" max="100" placeholder="98" value={form.spO2 ?? ''} onChange={e => set('spO2', parseFloat(e.target.value))} className="form-input text-sm mt-1" />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isTa ? 'அறிகுறிகள்' : 'Symptoms'}
              </label>
              <input
                type="text"
                placeholder={isTa ? 'தலைவலி, மூச்சுத்திணறல்...' : 'Headache, dizziness...'}
                value={form.symptoms || ''}
                onChange={e => set('symptoms', e.target.value)}
                className="form-input mt-1 text-sm"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isTa ? 'குறிப்புகள்' : 'Notes'}
              </label>
              <textarea
                rows={2}
                placeholder={isTa ? 'மருந்துகள், மருத்துவர் ஆலோசனை...' : 'Medications, doctor advice...'}
                value={form.notes || ''}
                onChange={e => set('notes', e.target.value)}
                className="form-input mt-1 text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-bold transition-colors"
            >
              <Save size={16} />
              <span>{saving ? (isTa ? 'சேமிக்கிறது...' : 'Saving...') : (isTa ? 'பதிவை சேமிக்கவும்' : 'Save Entry')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TrendingUp size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">{isTa ? 'இன்னும் பதிவுகள் இல்லை' : 'No entries yet'}</p>
          <p className="text-xs mt-1">{isTa ? 'முதல் பதிவை சேர்க்கவும்' : 'Tap "New Entry" to start tracking'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            {isTa ? 'பதிவுகள்' : 'History'} ({entries.length})
          </h2>
          {entries.map(entry => {
            const isExp = expandedId === entry.id;
            const bpInterp = entry.systolic && entry.diastolic ? interpretBP(entry.systolic, entry.diastolic) : null;
            const bsInterp = entry.bloodSugar ? interpretBloodSugar(entry.bloodSugar) : null;
            return (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExp ? null : entry.id!)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      {new Date(entry.date).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {entry.systolic && entry.diastolic && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          bpInterp?.color === 'text-emerald-600' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          bpInterp?.color === 'text-rose-600' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          ❤️ {entry.systolic}/{entry.diastolic}
                        </span>
                      )}
                      {entry.bloodSugar && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          bsInterp?.color === 'text-emerald-600' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          bsInterp?.color === 'text-rose-600' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          🍬 {entry.bloodSugar} mg/dL
                        </span>
                      )}
                      {entry.temperature && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          entry.temperature > 37.5 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          🌡️ {entry.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>
                  {isExp ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isExp && (
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-50 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      {entry.weight && <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100"><div className="text-[10px] text-slate-400">{isTa ? 'எடை' : 'Weight'}</div><div className="font-bold text-slate-700 text-sm">{entry.weight} kg</div></div>}
                      {entry.spO2 && <div className={`rounded-xl p-2.5 border ${entry.spO2 < 95 ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'}`}><div className="text-[10px] text-slate-400">SpO2</div><div className={`font-bold text-sm ${entry.spO2 < 95 ? 'text-rose-600' : 'text-blue-700'}`}>{entry.spO2}%</div></div>}
                    </div>
                    {entry.symptoms && <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100"><div className="text-[10px] font-bold text-amber-600 uppercase mb-1">{isTa ? 'அறிகுறிகள்' : 'Symptoms'}</div><p className="text-xs text-amber-800">{entry.symptoms}</p></div>}
                    {entry.notes && <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100"><div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{isTa ? 'குறிப்புகள்' : 'Notes'}</div><p className="text-xs text-slate-700">{entry.notes}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthJournal;
