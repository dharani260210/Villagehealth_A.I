import React, { useState, useMemo } from 'react';
import { SupportedLanguage } from '../types';
import { t } from '../translations';
import { Search, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, FlaskConical } from 'lucide-react';

interface LabTest {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  normalLabel: string;
  normalLabelTa: string;
  lowLabel: string;
  lowLabelTa: string;
  highLabel: string;
  highLabelTa: string;
  lowMeaning: string;
  lowMeaningTa: string;
  highMeaning: string;
  highMeaningTa: string;
  seekCare: string;
  seekCareTa: string;
}

const LAB_TESTS: LabTest[] = [
  {
    id: 'hb', name: 'Haemoglobin (Hb)', nameTa: 'ஹீமோகுளோபின்',
    category: 'CBC',
    unit: 'g/dL', normalMin: 12, normalMax: 17,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Anaemia', lowLabelTa: 'இரத்த சோகை',
    highLabel: 'Polycythaemia', highLabelTa: 'அதிக இரத்த அணுக்கள்',
    lowMeaning: 'Low haemoglobin. May cause fatigue, breathlessness, dizziness. Common in women & children.',
    lowMeaningTa: 'குறைவான ஹீமோகுளோபின். சோர்வு, மூச்சுத் திணறல், தலைச்சுற்றல் ஏற்படலாம்.',
    highMeaning: 'High haemoglobin. May be due to dehydration, smoking, or a blood disorder.',
    highMeaningTa: 'அதிக ஹீமோகுளோபின். நீர் வறட்சி அல்லது புகைப்பழக்கம் காரணமாக இருக்கலாம்.',
    seekCare: 'Seek care if Hb < 8 g/dL, or if you have chest pain or severe breathlessness.',
    seekCareTa: 'Hb 8 g/dL-க்கும் குறைவாக இருந்தால் அல்லது மார்பு வலி இருந்தால் உடனே மருத்துவரை அணுகவும்.',
  },
  {
    id: 'fbs', name: 'Fasting Blood Sugar (FBS)', nameTa: 'உபவாச இரத்த சர்க்கரை',
    category: 'Diabetes',
    unit: 'mg/dL', normalMin: 70, normalMax: 100,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Hypoglycaemia', lowLabelTa: 'குறைந்த சர்க்கரை',
    highLabel: 'High / Diabetic Range', highLabelTa: 'அதிக சர்க்கரை / நீரிழிவு',
    lowMeaning: 'Blood sugar too low. Can cause sweating, shakiness, fainting. Eat sugar immediately.',
    lowMeaningTa: 'இரத்த சர்க்கரை மிகவும் குறைவாக உள்ளது. உடனே சர்க்கரை அல்லது இனிப்பு சாப்பிடவும்.',
    highMeaning: '100–125: Pre-diabetic. Above 126: Diabetic range. Lifestyle changes and medication needed.',
    highMeaningTa: '100–125: நீரிழிவு முன் நிலை. 126-க்கு மேல்: நீரிழிவு. வாழ்க்கை முறை மாற்றம் தேவை.',
    seekCare: 'See a doctor if FBS > 126 mg/dL on two separate readings.',
    seekCareTa: 'இரண்டு முறை FBS 126-க்கு மேல் இருந்தால் மருத்துவரை சந்திக்கவும்.',
  },
  {
    id: 'hba1c', name: 'HbA1c (Glycated Haemoglobin)', nameTa: 'HbA1c (கிளைகேட்டட் ஹீமோகுளோபின்)',
    category: 'Diabetes',
    unit: '%', normalMin: 0, normalMax: 5.7,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Very Low (rare)', lowLabelTa: 'மிகவும் குறைவு',
    highLabel: 'Pre-diabetic / Diabetic', highLabelTa: 'நீரிழிவு நிலை',
    lowMeaning: 'Rarely a concern. May indicate certain anaemias.',
    lowMeaningTa: 'அரிதாக கவலைப்படத்தக்க நிலை.',
    highMeaning: '5.7–6.4%: Pre-diabetic. 6.5% and above: Diabetic. Shows avg blood sugar over 3 months.',
    highMeaningTa: '5.7–6.4%: நீரிழிவு முன் நிலை. 6.5% மேல்: நீரிழிவு. 3 மாத சராசரி சர்க்கரை அளவை காட்டுகிறது.',
    seekCare: 'Consult a doctor if HbA1c > 6.5% to start treatment.',
    seekCareTa: 'HbA1c 6.5%-க்கு மேல் இருந்தால் உடனே மருத்துவரை அணுகவும்.',
  },
  {
    id: 'creatinine', name: 'Serum Creatinine', nameTa: 'சீரம் கிரியேட்டினின்',
    category: 'Kidney',
    unit: 'mg/dL', normalMin: 0.6, normalMax: 1.2,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Low (usually fine)', lowLabelTa: 'குறைவு (பொதுவாக பரவாயில்லை)',
    highLabel: 'Kidney Strain / Failure', highLabelTa: 'சிறுநீரக பாதிப்பு',
    lowMeaning: 'Low creatinine is usually not a concern — can be normal in elderly or low muscle mass.',
    lowMeaningTa: 'குறைந்த கிரியேட்டினின் பொதுவாக கவலைப்படத்தக்கது அல்ல.',
    highMeaning: 'High creatinine suggests kidneys may not be filtering well. Could be dehydration or kidney disease.',
    highMeaningTa: 'அதிக கிரியேட்டினின் சிறுநீரகம் சரியாக வடிகட்டவில்லை என்று சுட்டிக்காட்டுகிறது.',
    seekCare: 'Seek care urgently if creatinine > 2.0 mg/dL or you have swelling, reduced urine output.',
    seekCareTa: 'கிரியேட்டினின் 2.0-க்கு மேல் அல்லது வீக்கம், சிறுநீர் குறைந்தால் உடனே மருத்துவரை அணுகவும்.',
  },
  {
    id: 'urea', name: 'Blood Urea / BUN', nameTa: 'இரத்த யூரியா',
    category: 'Kidney',
    unit: 'mg/dL', normalMin: 7, normalMax: 20,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Low', lowLabelTa: 'குறைவு',
    highLabel: 'Elevated (Azotaemia)', highLabelTa: 'அதிகமான யூரியா',
    lowMeaning: 'Low BUN may indicate malnutrition or liver disease.',
    lowMeaningTa: 'குறைந்த BUN ஊட்டச்சத்து குறைபாடு அல்லது கல்லீரல் நோயை குறிக்கலாம்.',
    highMeaning: 'High BUN suggests kidney stress. Check with creatinine for full kidney picture.',
    highMeaningTa: 'அதிக BUN சிறுநீரக அழுத்தத்தை சுட்டிக்காட்டுகிறது. கிரியேட்டினினுடன் சேர்த்து பரிசோதிக்கவும்.',
    seekCare: 'If BUN > 40 mg/dL with high creatinine, see a nephrologist urgently.',
    seekCareTa: 'BUN 40-க்கு மேல் மற்றும் கிரியேட்டினினும் அதிகமாக இருந்தால் சிறுநீரக நிபுணரை அணுகவும்.',
  },
  {
    id: 'tsh', name: 'TSH (Thyroid Stimulating Hormone)', nameTa: 'TSH (தைராய்டு ஊக்க ஹார்மோன்)',
    category: 'Thyroid',
    unit: 'mIU/L', normalMin: 0.4, normalMax: 4.0,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Hyperthyroidism', lowLabelTa: 'அதிக தைராய்டு',
    highLabel: 'Hypothyroidism', highLabelTa: 'குறைவான தைராய்டு',
    lowMeaning: 'Low TSH: overactive thyroid. May cause weight loss, rapid heartbeat, anxiety.',
    lowMeaningTa: 'குறைந்த TSH: அதிரிய தைராய்டு. எடை குறைதல், வேகமான நாடி, பதற்றம் ஏற்படலாம்.',
    highMeaning: 'High TSH: underactive thyroid. Causes fatigue, weight gain, cold intolerance, hair loss.',
    highMeaningTa: 'அதிக TSH: செயலற்ற தைராய்டு. சோர்வு, எடை அதிகரிப்பு, கூந்தல் உதிர்வு ஏற்படலாம்.',
    seekCare: 'See an endocrinologist if TSH < 0.1 or > 10 mIU/L.',
    seekCareTa: 'TSH 0.1-க்கும் குறைவாகவோ அல்லது 10-க்கும் மேலாகவோ இருந்தால் மருத்துவரை அணுகவும்.',
  },
  {
    id: 'alt', name: 'ALT / SGPT (Liver Enzyme)', nameTa: 'ALT / SGPT (கல்லீரல் என்சைம்)',
    category: 'Liver',
    unit: 'U/L', normalMin: 7, normalMax: 56,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Low (usually fine)', lowLabelTa: 'குறைவு',
    highLabel: 'Liver Stress / Damage', highLabelTa: 'கல்லீரல் பாதிப்பு',
    lowMeaning: 'Low ALT is generally not a concern.',
    lowMeaningTa: 'குறைந்த ALT பொதுவாக கவலைப்படத்தக்கது அல்ல.',
    highMeaning: 'Elevated ALT indicates liver cell damage. Causes include alcohol, fatty liver, hepatitis, medications.',
    highMeaningTa: 'அதிக ALT கல்லீரல் செல் பாதிப்பை காட்டுகிறது. மது, கொழுப்பு கல்லீரல், ஹெபடைட்டிஸ் காரணமாக இருக்கலாம்.',
    seekCare: 'See a doctor if ALT > 3x normal (>168). Avoid alcohol and self-medication.',
    seekCareTa: 'ALT 168-க்கு மேல் இருந்தால் மருத்துவரை அணுகவும். மது மற்றும் சுய மருந்தை தவிர்க்கவும்.',
  },
  {
    id: 'cholesterol', name: 'Total Cholesterol', nameTa: 'மொத்த கொலஸ்டிரால்',
    category: 'Heart',
    unit: 'mg/dL', normalMin: 0, normalMax: 200,
    normalLabel: 'Desirable', normalLabelTa: 'விரும்பத்தக்க அளவு',
    lowLabel: 'Very Low (rare)', lowLabelTa: 'மிகவும் குறைவு',
    highLabel: 'High / Borderline High', highLabelTa: 'அதிக கொலஸ்டிரால்',
    lowMeaning: 'Very low cholesterol is rare and may indicate malabsorption or liver disease.',
    lowMeaningTa: 'மிகவும் குறைந்த கொலஸ்டிரால் அரிதானது.',
    highMeaning: '200–239: Borderline high. 240+: High risk of heart disease and stroke.',
    highMeaningTa: '200–239: எல்லை அளவு. 240+: இதய நோய் மற்றும் பக்கவாதம் அதிக ஆபத்து.',
    seekCare: 'If cholesterol > 240, see a doctor to start statin therapy and diet changes.',
    seekCareTa: 'கொலஸ்டிரால் 240-க்கு மேல் இருந்தால் மருத்துவரிடம் சென்று சிகிச்சை தொடங்கவும்.',
  },
  {
    id: 'wbc', name: 'WBC (White Blood Cells)', nameTa: 'வெள்ளை இரத்த அணுக்கள்',
    category: 'CBC',
    unit: 'cells/µL (×10³)', normalMin: 4.5, normalMax: 11.0,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Leukopenia', lowLabelTa: 'குறைவான வெள்ளை அணு',
    highLabel: 'Leukocytosis', highLabelTa: 'அதிக வெள்ளை அணு',
    lowMeaning: 'Low WBC means reduced immunity. May indicate viral infections, bone marrow issues, or medication side effects.',
    lowMeaningTa: 'குறைந்த WBC நோய் எதிர்ப்பு சக்தி குறைவைக் காட்டுகிறது.',
    highMeaning: 'High WBC indicates the body is fighting infection, inflammation, or (rarely) blood cancer.',
    highMeaningTa: 'அதிக WBC நோய் தொற்று, வீக்கம் அல்லது (அரிதாக) இரத்த புற்றுநோயைக் காட்டுகிறது.',
    seekCare: 'Seek care if WBC < 2.0 or > 20 × 10³ cells/µL.',
    seekCareTa: 'WBC 2.0-க்கும் குறைவாகவோ அல்லது 20-க்கும் மேலாகவோ இருந்தால் மருத்துவரை அணுகவும்.',
  },
  {
    id: 'platelets', name: 'Platelet Count', nameTa: 'பிளேட்லெட் எண்ணிக்கை',
    category: 'CBC',
    unit: 'cells/µL (×10³)', normalMin: 150, normalMax: 400,
    normalLabel: 'Normal', normalLabelTa: 'சாதாரண',
    lowLabel: 'Thrombocytopenia', lowLabelTa: 'குறைவான பிளேட்லெட்',
    highLabel: 'Thrombocytosis', highLabelTa: 'அதிக பிளேட்லெட்',
    lowMeaning: 'Low platelets → bleeding risk. Important in dengue fever. Below 20,000 is life-threatening.',
    lowMeaningTa: 'குறைந்த பிளேட்லெட் → இரத்தப்போக்கு ஆபத்து. டெங்கு காய்ச்சலில் முக்கியம். 20,000-க்கும் குறைவு உயிரை அச்சுறுத்தும்.',
    highMeaning: 'High platelets may increase clotting risk. Can occur after surgery or with inflammatory conditions.',
    highMeaningTa: 'அதிக பிளேட்லெட் இரத்த உறைவு ஆபத்தை அதிகரிக்கலாம்.',
    seekCare: 'Emergency: platelets below 20,000 or active unexplained bruising/bleeding.',
    seekCareTa: 'அவசரம்: பிளேட்லெட் 20,000-க்கும் குறைவாக இருந்தால் உடனே மருத்துவமனை செல்லவும்.',
  },
];

const CATEGORIES = ['All', 'CBC', 'Diabetes', 'Kidney', 'Thyroid', 'Liver', 'Heart'];

interface LabTestGuideProps {
  language: SupportedLanguage;
}

const LabTestGuide: React.FC<LabTestGuideProps> = ({ language }) => {
  const lang = language.code;
  const isTa = lang === 'ta';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userValues, setUserValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return LAB_TESTS.filter(test => {
      const matchesSearch =
        !q ||
        test.name.toLowerCase().includes(q) ||
        test.nameTa.includes(search) ||
        test.category.toLowerCase().includes(q);
      const matchesCat = category === 'All' || test.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

  function getResult(test: LabTest, raw: string) {
    const val = parseFloat(raw);
    if (isNaN(val)) return null;
    if (val < test.normalMin) return { status: 'low', label: isTa ? test.lowLabelTa : test.lowLabel };
    if (val > test.normalMax) return { status: 'high', label: isTa ? test.highLabelTa : test.highLabel };
    return { status: 'normal', label: isTa ? test.normalLabelTa : test.normalLabel };
  }

  function resultColor(status: string) {
    if (status === 'normal') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'low') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  function resultIcon(status: string) {
    if (status === 'normal') return <CheckCircle size={14} className="text-emerald-600" />;
    if (status === 'low') return <AlertCircle size={14} className="text-blue-600" />;
    return <XCircle size={14} className="text-rose-600" />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {isTa ? 'ஆய்வக சோதனை வழிகாட்டி' : 'Lab Test Reference Guide'}
            </h1>
            <p className="text-violet-200 text-xs">
              {isTa
                ? 'உங்கள் பரிசோதனை முடிவுகளை புரிந்துகொள்ளுங்கள்'
                : 'Understand your medical test results in plain language'}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex space-x-2 mb-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isTa ? 'சோதனையை தேடுங்கள்...' : 'Search tests...'}
            className="form-input pl-9"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="form-select w-36"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Test Cards */}
      <div className="space-y-3">
        {filtered.map(test => {
          const isExpanded = expandedId === test.id;
          const rawVal = userValues[test.id] || '';
          const result = getResult(test, rawVal);

          return (
            <div key={test.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Card Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : test.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    {isTa ? test.nameTa : test.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {test.category} · {isTa ? 'சாதாரண: ' : 'Normal: '}{test.normalMin}–{test.normalMax} {test.unit}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {result && (
                    <span className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-xl border ${resultColor(result.status)}`}>
                      {resultIcon(result.status)}
                      <span>{result.label}</span>
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Value Input — always visible */}
              <div className="px-4 pb-3 border-t border-slate-50">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {isTa ? 'உங்கள் மதிப்பை உள்ளிடுங்கள்' : 'Enter your value'} ({test.unit})
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={rawVal}
                    onChange={e => setUserValues(prev => ({ ...prev, [test.id]: e.target.value }))}
                    placeholder={`e.g. ${test.normalMin + (test.normalMax - test.normalMin) / 2}`}
                    className="form-input flex-1 text-sm"
                  />
                  {rawVal && <button onClick={() => setUserValues(prev => ({ ...prev, [test.id]: '' }))} className="text-xs text-slate-400 hover:text-rose-500 px-2">✕</button>}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                        {isTa ? 'குறைவாக இருந்தால்' : 'If Low'}
                      </div>
                      <p className="text-xs text-blue-800">{isTa ? test.lowMeaningTa : test.lowMeaning}</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                      <div className="text-[10px] font-bold text-rose-600 uppercase mb-1">
                        {isTa ? 'அதிகமாக இருந்தால்' : 'If High'}
                      </div>
                      <p className="text-xs text-rose-800">{isTa ? test.highMeaningTa : test.highMeaning}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <div className="text-[10px] font-bold text-amber-700 uppercase mb-1 flex items-center space-x-1">
                        <AlertCircle size={11} />
                        <span>{isTa ? 'மருத்துவரை எப்போது சந்திக்கவும்' : 'When to seek care'}</span>
                      </div>
                      <p className="text-xs text-amber-800">{isTa ? test.seekCareTa : test.seekCare}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <FlaskConical size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{isTa ? 'சோதனை கிடைக்கவில்லை' : 'No tests found'}</p>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6 px-4">
        {isTa
          ? 'இந்த வழிகாட்டி பொது தகவல் மட்டுமே. எல்லா முடிவுகளையும் மருத்துவரிடம் விவாதிக்கவும்.'
          : 'This guide is for general reference only. Always discuss all results with your doctor.'}
      </p>
    </div>
  );
};

export default LabTestGuide;
