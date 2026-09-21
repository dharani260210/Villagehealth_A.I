import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { ref, onValue, off } from 'firebase/database';
import { db, isFirebaseConfigured } from '../services/firebaseConfig';
import { BloodBank, BloodBankStock } from '../types';
import { BarChart2, Droplets, AlertCircle, RefreshCw } from 'lucide-react';

interface BloodStockDashboardProps {
  language: SupportedLanguage;
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

const TN_DISTRICTS_LIST = [
  'All', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Namakkal', 'Krishnagiri', 'Dharmapuri', 'Tiruppur',
];

// Demo fallback data
const DEMO_BANKS: BloodBank[] = [
  { id: 'b1', name: 'Rajiv Gandhi GH', address: 'Chennai', district: 'Chennai', phone: '044-25305000', type: 'Government', stock: { 'A+': 12, 'A-': 3, 'B+': 8, 'B-': 1, 'O+': 18, 'O-': 2, 'AB+': 5, 'AB-': 0 }, updatedAt: Date.now() },
  { id: 'b2', name: 'KMCH Blood Bank', address: 'Coimbatore', district: 'Coimbatore', phone: '0422-4323800', type: 'Hospital', stock: { 'A+': 6, 'A-': 0, 'B+': 14, 'B-': 2, 'O+': 9, 'O-': 3, 'AB+': 2, 'AB-': 1 }, updatedAt: Date.now() },
  { id: 'b3', name: 'GMC Blood Centre', address: 'Madurai', district: 'Madurai', phone: '0452-2532535', type: 'Government', stock: { 'A+': 4, 'A-': 2, 'B+': 7, 'B-': 0, 'O+': 11, 'O-': 1, 'AB+': 3, 'AB-': 0 }, updatedAt: Date.now() },
  { id: 'b4', name: 'Sri Ramachandra BB', address: 'Chennai', district: 'Chennai', phone: '044-45928500', type: 'Hospital', stock: { 'A+': 9, 'A-': 1, 'B+': 5, 'B-': 1, 'O+': 15, 'O-': 4, 'AB+': 6, 'AB-': 2 }, updatedAt: Date.now() },
];

function stockColor(units: number) {
  if (units === 0) return 'bg-rose-500';
  if (units < 5) return 'bg-amber-400';
  if (units < 10) return 'bg-yellow-300';
  return 'bg-emerald-400';
}

function stockBgColor(units: number) {
  if (units === 0) return 'bg-rose-50 border-rose-200 text-rose-700';
  if (units < 5) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-emerald-50 border-emerald-200 text-emerald-700';
}

const BloodStockDashboard: React.FC<BloodStockDashboardProps> = ({ language }) => {
  const isTa = language.code === 'ta';
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const r = ref(db, 'bloodBanks');
      setLoading(true);
      const handler = (snap: any) => {
        const list: BloodBank[] = [];
        if (snap.exists()) {
          snap.forEach((child: any) => list.push({ id: child.key, ...child.val() }));
        }
        setBanks(list.length > 0 ? list : DEMO_BANKS);
        setLoading(false);
      };
      onValue(r, handler);
      return () => off(r, 'value', handler);
    } else {
      setBanks(DEMO_BANKS);
      setLoading(false);
      return () => {};
    }
  }, []);

  const filtered = district === 'All' ? banks : banks.filter(b => b.district === district);

  // Aggregate totals per blood type across filtered banks
  const totals: BloodBankStock = BLOOD_TYPES.reduce((acc, bt) => {
    acc[bt] = filtered.reduce((sum, bank) => sum + (bank.stock[bt] || 0), 0);
    return acc;
  }, {} as BloodBankStock);

  const maxTotal = Math.max(...Object.values(totals), 1);
  const criticalTypes = BLOOD_TYPES.filter(bt => totals[bt] === 0);
  const lowTypes = BLOOD_TYPES.filter(bt => totals[bt] > 0 && totals[bt] < 5);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <BarChart2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {isTa ? 'மாவட்ட இரத்த கையிருப்பு டாஷ்போர்டு' : 'District Blood Stock Dashboard'}
            </h1>
            <p className="text-rose-200 text-xs">
              {isTa ? 'நேரடி இரத்த இருப்பு அளவுகள்' : 'Live blood stock levels across Tamil Nadu'}
            </p>
          </div>
        </div>

        {/* District filter */}
        <select
          value={district}
          onChange={e => setDistrict(e.target.value)}
          className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white text-sm font-semibold appearance-none focus:outline-none"
        >
          {TN_DISTRICTS_LIST.map(d => <option key={d} value={d} className="text-slate-800">{d === 'All' ? (isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts') : d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-rose-500" />
        </div>
      ) : (
        <>
          {/* Alert banners */}
          {criticalTypes.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-3 flex items-start space-x-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-700">
                  {isTa ? '🚨 இரத்த பற்றாக்குறை:' : '🚨 Critical Shortage:'} {criticalTypes.join(', ')}
                </p>
                <p className="text-[10px] text-rose-600 mt-0.5">
                  {isTa ? 'இந்த இரத்த வகைகள் தேர்ந்த பகுதியில் கிடைக்கவில்லை.' : 'These blood types have zero units in the selected area.'}
                </p>
              </div>
            </div>
          )}
          {lowTypes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3 flex items-start space-x-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-700">
                {isTa ? '⚠️ குறைந்த இருப்பு:' : '⚠️ Low Stock:'} {lowTypes.join(', ')}
              </p>
            </div>
          )}

          {/* Aggregate Bar Chart */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4">
              {isTa ? 'மொத்த இரத்த இருப்பு (யூனிட்)' : 'Total Blood Stock by Type (units)'}
              <span className="text-[10px] font-normal text-slate-400 ml-2">
                {filtered.length} {isTa ? 'மருத்துவமனைகள்' : 'banks'}
              </span>
            </h2>
            <div className="space-y-3">
              {BLOOD_TYPES.map(bt => {
                const units = totals[bt];
                const pct = Math.round((units / maxTotal) * 100);
                return (
                  <div key={bt} className="flex items-center space-x-3">
                    <div className={`w-12 text-center text-xs font-black rounded-lg py-1 border ${stockBgColor(units)}`}>
                      {bt}
                    </div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${stockColor(units)}`}
                        style={{ width: `${Math.max(pct, units > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <div className={`w-10 text-right text-sm font-black ${
                      units === 0 ? 'text-rose-600' : units < 5 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {units}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> <span>{isTa ? 'போதுமானது (≥10)' : 'Good (≥10)'}</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> <span>{isTa ? 'குறைவு (<5)' : 'Low (<5)'}</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> <span>{isTa ? 'கிடையாது' : 'None'}</span></span>
            </div>
          </div>

          {/* Per-Bank Breakdown */}
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
            {isTa ? 'மருத்துவமனை வாரியான விவரம்' : 'Per Bank Breakdown'}
          </h2>
          <div className="space-y-3">
            {filtered.map(bank => (
              <div key={bank.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{bank.name}</div>
                    <div className="text-xs text-slate-400">{bank.district} · {bank.type}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-xl border ${
                    bank.type === 'Government' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    {bank.type}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BLOOD_TYPES.map(bt => (
                    <div key={bt} className={`text-center rounded-xl p-1.5 border ${stockBgColor(bank.stock[bt] || 0)}`}>
                      <div className="text-[10px] font-black">{bt}</div>
                      <div className="text-sm font-black">{bank.stock[bt] || 0}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <Droplets size={11} className="text-slate-400" />
                  <a href={`tel:${bank.phone}`} className="text-xs text-slate-400 hover:text-rose-600 font-medium">{bank.phone}</a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BloodStockDashboard;
