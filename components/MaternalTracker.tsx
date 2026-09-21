import React, { useState, useMemo } from 'react';
import { SupportedLanguage } from '../types';
import { Baby, Calendar, AlertTriangle, Phone, ChevronDown, ChevronUp, Heart, Activity } from 'lucide-react';

interface MaternalTrackerProps {
  language: SupportedLanguage;
}

interface WeekCard {
  weeks: number[];
  title: string;
  titleTa: string;
  milestone: string;
  milestoneTa: string;
  tip: string;
  tipTa: string;
}

const WEEK_CARDS: WeekCard[] = [
  {
    weeks: [1, 2, 3, 4],
    title: 'Weeks 1–4: Conception',
    titleTa: 'வாரம் 1–4: கருத்தரிப்பு',
    milestone: 'Fertilisation occurs. The embryo implants into the uterine wall. Start folic acid 400 mcg daily.',
    milestoneTa: 'கருத்தரிப்பு நடைபெறுகிறது. கரு கர்ப்பப்பை சுவரில் பதிகிறது. தினமும் ஃபோலிக் அமிலம் 400 mcg எடுக்கவும்.',
    tip: 'Stop alcohol, smoking. Take folic acid. Book your first antenatal visit.',
    tipTa: 'மது, புகைப்பழக்கத்தை நிறுத்துங்கள். ஃபோலிக் அமிலம் எடுங்கள். முதல் கர்ப்பகால சோதனை பதிவு செய்யுங்கள்.',
  },
  {
    weeks: [5, 6, 7, 8, 9, 10, 11, 12],
    title: 'Weeks 5–12: 1st Trimester',
    titleTa: 'வாரம் 5–12: முதல் மூன்று மாதம்',
    milestone: 'Heart begins beating (wk 6). Fingers form (wk 8). Face, limbs forming. Morning sickness is common.',
    milestoneTa: 'இதயம் துடிக்கத் தொடங்குகிறது (வாரம் 6). விரல்கள் உருவாகின்றன (வாரம் 8). காலை குமட்டல் சாதாரணம்.',
    tip: '1st Antenatal Visit (8–12 weeks): Blood tests, ultrasound, iron + folic acid prescription. Eat small frequent meals for nausea.',
    tipTa: '1வது கர்ப்பகால சோதனை (8–12 வாரம்): இரத்த பரிசோதனை, அல்ட்ராசவுண்ட். குமட்டலுக்கு சிறிய அளவில் அடிக்கடி சாப்பிடுங்கள்.',
  },
  {
    weeks: [13, 14, 15, 16, 17, 18, 19, 20],
    title: 'Weeks 13–20: 2nd Trimester',
    titleTa: 'வாரம் 13–20: இரண்டாம் மூன்று மாதம்',
    milestone: 'Baby can hear sounds (wk 16). First fetal movements felt (quickening, wk 18–20). Anatomy scan due.',
    milestoneTa: 'குழந்தை சத்தம் கேட்கத் தொடங்குகிறது (வாரம் 16). முதல் அசைவு உணர்கிறீர்கள் (வாரம் 18–20).',
    tip: '2nd Antenatal Visit (16–20 weeks): Anomaly scan (20-week ultrasound). Monitor fetal movement daily.',
    tipTa: '2வது கர்ப்பகால சோதனை (16–20 வாரம்): உறுப்பு அல்ட்ராசவுண்ட். தினமும் குழந்தையின் அசைவை கவனிக்கவும்.',
  },
  {
    weeks: [21, 22, 23, 24, 25, 26, 27, 28],
    title: 'Weeks 21–28: Mid-Pregnancy',
    titleTa: 'வாரம் 21–28: நடு கர்ப்பம்',
    milestone: 'Baby opens eyes (wk 26). Lungs begin developing. Baby weighs ~1 kg by week 28.',
    milestoneTa: 'குழந்தை கண்களை திறக்கிறது (வாரம் 26). நுரையீரல் வளர்கிறது. வாரம் 28-ல் எடை சுமார் 1 கிலோ.',
    tip: '3rd Antenatal Visit (28 weeks): GDM test (glucose screening), Rh testing, tetanus vaccine (TT2). Sleep on left side.',
    tipTa: '3வது கர்ப்பகால சோதனை (28 வாரம்): நீரிழிவு பரிசோதனை, Rh சோதனை, TT2 தடுப்பூசி. இடது பக்கமாக தூங்குங்கள்.',
  },
  {
    weeks: [29, 30, 31, 32, 33, 34, 35, 36],
    title: 'Weeks 29–36: 3rd Trimester',
    titleTa: 'வாரம் 29–36: மூன்றாம் மூன்று மாதம்',
    milestone: 'Baby gains weight rapidly. Kick counts important. Baby positions for birth.',
    milestoneTa: 'குழந்தை வேகமாக எடை எடுக்கிறது. உதைத்தல் எண்ணிக்கை முக்கியம். குழந்தை பிரசவ நிலைக்கு திரும்புகிறது.',
    tip: '4th Antenatal Visit (36 weeks): Baby position check, pelvic assessment, hospital bag ready. Count 10 kicks/2 hours daily.',
    tipTa: '4வது கர்ப்பகால சோதனை (36 வாரம்): குழந்தையின் நிலை சோதனை. தினமும் 2 மணி நேரத்தில் 10 உதைகளை எண்ணுங்கள்.',
  },
  {
    weeks: [37, 38, 39, 40],
    title: 'Weeks 37–40: Full Term',
    titleTa: 'வாரம் 37–40: முழு கர்ப்ப காலம்',
    milestone: 'Baby is full-term! Lung maturity complete. Ready for birth. Regular contractions begin.',
    milestoneTa: 'குழந்தை முழுமையாக வளர்ந்துள்ளது! நுரையீரல் முதிர்ச்சி பூர்த்தி. பிரசவ வலி தொடங்கலாம்.',
    tip: 'Go to hospital immediately: contractions every 5 min, water breaks, or reduced fetal movement.',
    tipTa: 'உடனே மருத்துவமனை செல்லுங்கள்: 5 நிமிடத்திற்கு ஒரு வலி, நீர் உடைந்தால், அல்லது குழந்தை அசைவில்லாமல் இருந்தால்.',
  },
];

const DANGER_SIGNS = [
  { en: 'Heavy vaginal bleeding at any stage', ta: 'எந்த நிலையிலும் கடுமையான யோனி இரத்தப்போக்கு' },
  { en: 'Severe headache that does not go away', ta: 'போகாத கடுமையான தலைவலி' },
  { en: 'Blurred vision or seeing flashes of light', ta: 'மங்கலான பார்வை அல்லது ஒளி தெரிவது' },
  { en: 'Severe swelling of face, hands, or feet', ta: 'முகம், கைகள் அல்லது கால்களில் கடுமையான வீக்கம்' },
  { en: 'Decreased or absent baby movements (after 20 weeks)', ta: '20 வாரங்களுக்கு பிறகு குழந்தை அசைவு குறைந்தால் அல்லது இல்லாவிட்டால்' },
  { en: 'High fever (> 38°C / 100.4°F)', ta: 'அதிக காய்ச்சல் (38°C-க்கு மேல்)' },
  { en: 'Painful burning when urinating', ta: 'சிறுநீர் கழிக்கும்போது எரிச்சல் வலி' },
  { en: 'Convulsions / fits', ta: 'வலிப்பு' },
];

const ANTENATAL_VISITS = [
  { timing: '8–12 weeks', timingTa: '8–12 வாரம்', desc: 'BP, Blood tests, Urine, USS dating scan, Iron + Folic acid', descTa: 'BP, இரத்த சோதனை, சிறுநீர், அல்ட்ராசவுண்ட், இரும்பு + ஃபோலிக் அமிலம்' },
  { timing: '16–20 weeks', timingTa: '16–20 வாரம்', desc: 'Anomaly scan (20-week USS), Blood sugar, TT1 vaccine', descTa: 'உறுப்பு அல்ட்ராசவுண்ட், இரத்த சர்க்கரை, TT1 தடுப்பூசி' },
  { timing: '28 weeks', timingTa: '28 வாரம்', desc: 'GDM glucose test, Hb, Rh antibodies, TT2 vaccine, BP', descTa: 'நீரிழிவு பரிசோதனை, Hb, Rh, TT2 தடுப்பூசி, BP' },
  { timing: '36 weeks', timingTa: '36 வாரம்', desc: 'Baby position, pelvis check, birth plan, Hb, hospital bag', descTa: 'குழந்தை நிலை, பிரசவ திட்டம், Hb, மருத்துவமனை பை தயார்' },
];

const MaternalTracker: React.FC<MaternalTrackerProps> = ({ language }) => {
  const lang = language.code;
  const isTa = lang === 'ta';
  const [lmpDate, setLmpDate] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showDanger, setShowDanger] = useState(false);

  const pregnancyInfo = useMemo(() => {
    if (!lmpDate) return null;
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lmp.getTime()) / 86400000);
    const weeks = Math.floor(diffDays / 7);
    const daysExtra = diffDays % 7;
    const edd = new Date(lmp.getTime() + 280 * 86400000);
    const daysToEdd = Math.floor((edd.getTime() - now.getTime()) / 86400000);
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    return { weeks, daysExtra, edd, daysToEdd, trimester };
  }, [lmpDate]);

  const currentCard = pregnancyInfo
    ? WEEK_CARDS.find(card => card.weeks.includes(Math.min(pregnancyInfo.weeks, 40)))
    : null;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Baby size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {isTa ? 'தாய்மை ஆரோக்கிய கண்காணிப்பு' : 'Maternal Health Tracker'}
            </h1>
            <p className="text-pink-200 text-xs">
              {isTa ? 'கர்ப்பகால வழிகாட்டி மற்றும் அவசர அறிகுறிகள்' : 'Pregnancy guide & antenatal care checklist'}
            </p>
          </div>
        </div>

        {/* LMP Input */}
        <div>
          <label className="text-xs font-semibold text-pink-200 mb-1 block">
            {isTa ? 'கடைசி மாதவிடாய் தேதி (LMP)' : 'Last Menstrual Period (LMP) Date'}
          </label>
          <input
            type="date"
            value={lmpDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setLmpDate(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white text-sm font-semibold placeholder-pink-200 focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Pregnancy Status Card */}
      {pregnancyInfo && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-pink-100">
          {pregnancyInfo.weeks > 42 ? (
            <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
              <AlertTriangle size={28} className="text-rose-500 mx-auto mb-2" />
              <p className="text-rose-700 font-bold text-sm">
                {isTa ? 'உங்கள் LMP 42 வாரங்களுக்கும் பழமையானது.' : 'Your LMP is over 42 weeks ago.'}
              </p>
              <p className="text-rose-600 text-xs mt-1">
                {isTa ? 'சரியான தேதியை உறுதிப்படுத்தி மருத்துவரை அணுகவும்.' : 'Please confirm the date and consult your doctor.'}
              </p>
            </div>
          ) : pregnancyInfo.weeks < 1 ? (
            <p className="text-center text-slate-500 text-sm">
              {isTa ? 'எதிர்கால தேதியை தேர்ந்தெடுத்தீர்கள். LMP கடந்த தேதியாக இருக்க வேண்டும்.' : 'Please select a past date for LMP.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100">
                  <div className="text-2xl font-black text-pink-600">{pregnancyInfo.weeks}</div>
                  <div className="text-[10px] text-pink-500 font-semibold">{isTa ? 'வாரங்கள்' : 'Weeks'}</div>
                  <div className="text-[10px] text-pink-400">+ {pregnancyInfo.daysExtra} {isTa ? 'நாட்கள்' : 'days'}</div>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
                  <div className="text-lg font-black text-violet-600">{pregnancyInfo.trimester}</div>
                  <div className="text-[10px] text-violet-500 font-semibold">{isTa ? 'மூன்று மாதம்' : 'Trimester'}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-lg font-black text-emerald-600">
                    {pregnancyInfo.daysToEdd > 0 ? pregnancyInfo.daysToEdd : 0}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-semibold">{isTa ? 'நாட்கள் மீதம்' : 'Days left'}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex items-center space-x-3 border border-slate-100 mb-3">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {isTa ? 'எதிர்பார்க்கப்படும் பிரசவ தேதி (EDD)' : 'Expected Due Date (EDD)'}
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {pregnancyInfo.edd.toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Current week card */}
              {currentCard && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                  <div className="font-bold text-sm text-rose-700 mb-1">
                    {isTa ? currentCard.titleTa : currentCard.title}
                  </div>
                  <p className="text-xs text-rose-600 leading-relaxed mb-2">
                    {isTa ? currentCard.milestoneTa : currentCard.milestone}
                  </p>
                  <div className="bg-white rounded-lg p-2.5 border border-rose-100">
                    <div className="text-[10px] font-bold text-rose-500 uppercase mb-1">
                      {isTa ? 'இந்த வாரம் செய்ய வேண்டியது' : 'This week — action'}
                    </div>
                    <p className="text-xs text-slate-700">{isTa ? currentCard.tipTa : currentCard.tip}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Antenatal Visit Schedule */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
          <Activity size={16} className="text-pink-500" />
          <span>{isTa ? 'கர்ப்பகால சோதனை அட்டவணை' : 'Antenatal Visit Schedule'}</span>
        </h2>
        <div className="space-y-2">
          {ANTENATAL_VISITS.map((visit, i) => {
            const weekNo = parseInt(visit.timing.split('–')[0]);
            const isDone = pregnancyInfo ? pregnancyInfo.weeks > weekNo + 2 : false;
            const isCurrent = pregnancyInfo
              ? pregnancyInfo.weeks >= weekNo - 4 && !isDone
              : false;
            return (
              <div
                key={i}
                className={`flex items-start space-x-3 p-3 rounded-xl border ${
                  isCurrent ? 'bg-pink-50 border-pink-200' : isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black mt-0.5 ${
                  isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">
                    {isTa ? visit.timingTa : visit.timing}
                    {isCurrent && <span className="ml-2 text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full">NOW</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{isTa ? visit.descTa : visit.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pregnancy Week Cards */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
          <Heart size={16} className="text-pink-500" />
          <span>{isTa ? 'வார வழிகாட்டி' : 'Week-by-Week Guide'}</span>
        </h2>
        <div className="space-y-2">
          {WEEK_CARDS.map((card, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 text-left bg-slate-50 hover:bg-pink-50 transition-colors"
                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
              >
                <span className="text-xs font-bold text-slate-700">
                  {isTa ? card.titleTa : card.title}
                </span>
                {expandedCard === i ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {expandedCard === i && (
                <div className="p-3 space-y-2">
                  <p className="text-xs text-slate-600">{isTa ? card.milestoneTa : card.milestone}</p>
                  <div className="bg-pink-50 rounded-lg p-2.5 border border-pink-100">
                    <p className="text-xs text-pink-700">{isTa ? card.tipTa : card.tip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Signs */}
      <div className="bg-rose-50 rounded-2xl p-4 mb-4 border border-rose-200">
        <button
          onClick={() => setShowDanger(!showDanger)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle size={18} className="text-rose-600" />
            <h2 className="text-sm font-bold text-rose-700">
              {isTa ? '⚠️ அவசர அறிகுறிகள்' : '⚠️ Danger Signs — Go to Hospital Immediately'}
            </h2>
          </div>
          {showDanger ? <ChevronUp size={16} className="text-rose-500" /> : <ChevronDown size={16} className="text-rose-500" />}
        </button>
        {showDanger && (
          <ul className="mt-3 space-y-2">
            {DANGER_SIGNS.map((sign, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-rose-700">
                <span className="text-rose-500 shrink-0 mt-0.5">•</span>
                <span>{isTa ? sign.ta : sign.en}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Emergency Numbers */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3">
          {isTa ? 'அவசர தொலைபேசி எண்கள்' : 'Emergency Numbers'}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { num: '104', desc: isTa ? 'மருத்துவ உதவி' : 'Health Helpline', color: 'emerald' },
            { num: '108', desc: isTa ? 'ஆம்புலன்ஸ்' : 'Ambulance', color: 'rose' },
            { num: '102', desc: isTa ? 'தாய் மற்றும் குழந்தை' : 'Mother & Child', color: 'pink' },
            { num: '1091', desc: isTa ? 'பெண்கள் உதவி' : 'Women Helpline', color: 'violet' },
          ].map(e => (
            <a
              key={e.num}
              href={`tel:${e.num}`}
              className={`flex items-center space-x-2 p-3 bg-${e.color}-50 border border-${e.color}-100 rounded-xl`}
            >
              <Phone size={14} className={`text-${e.color}-500`} />
              <div>
                <div className={`font-black text-sm text-${e.color}-700`}>{e.num}</div>
                <div className="text-[10px] text-slate-500">{e.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaternalTracker;
