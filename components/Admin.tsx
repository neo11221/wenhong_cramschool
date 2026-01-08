
import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Check, Search, X, ScanLine, Gift, History as HistoryIcon, GraduationCap, Users, TrendingUp, Award } from 'lucide-react';
import { Redemption, UserProfile } from '../types';
import { getRedemptions, updateRedemptionStatus, getStudents, saveStudents } from '../utils/storage';
import { RANKS } from '../constants';

interface AdminProps {
  onRefresh: () => void;
}

const Admin: React.FC<AdminProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'scan' | 'points' | 'history'>('roster');
  const [isScanning, setIsScanning] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanResult, setScanResult] = useState<Redemption | null>(null);
  
  // 點數管理相關狀態
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [pointAmount, setPointAmount] = useState<string>('100');
  const [reason, setReason] = useState('考試成績優異');

  useEffect(() => {
    setRedemptions(getRedemptions());
    setStudents(getStudents());
    // 預設選擇第一位同學
    const initialStudents = getStudents();
    if (initialStudents.length > 0) {
      setTargetStudentId(initialStudents[0].id);
    }
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    setTimeout(() => {
      const pending = redemptions.find(r => r.status === 'pending');
      if (pending) {
        setScanResult(pending);
      } else {
        alert('未發現任何待處理的兌換項目');
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirmRedemption = (id: string) => {
    updateRedemptionStatus(id, 'completed');
    setRedemptions(getRedemptions());
    setScanResult(null);
    onRefresh();
    alert('✅ 核銷成功！商品已發放。');
  };

  const handleIssuePoints = () => {
    const amount = parseInt(pointAmount);
    if (isNaN(amount) || !targetStudentId) return;

    const updatedStudents = students.map(s => {
      if (s.id === targetStudentId) {
        return {
          ...s,
          points: s.points + amount,
          totalEarned: amount > 0 ? s.totalEarned + amount : s.totalEarned
        };
      }
      return s;
    });
    
    saveStudents(updatedStudents);
    setStudents(updatedStudents);
    onRefresh();
    const studentName = students.find(s => s.id === targetStudentId)?.name;
    alert(`✅ 已成功為 ${studentName} 發放 ${amount} 點！\n原因：${reason}`);
    setPointAmount('');
  };

  const filteredRedemptions = redemptions.filter(r => 
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.includes(searchTerm)
  );

  const getRank = (totalEarned: number) => {
    return RANKS.reduce((prev, curr) => {
      if (totalEarned >= curr.threshold) return curr;
      return prev;
    }, RANKS[0]);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <ShieldCheck size={32} />
            </div>
            管理權限中心
          </h1>
          <p className="text-slate-500 mt-2 italic font-medium">「賦予學生學習動能，即時追蹤成長軌跡。」</p>
        </div>
      </header>

      {/* 功能切換導覽 */}
      <div className="flex bg-white p-2 rounded-3xl border border-slate-100 shadow-md overflow-x-auto">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black transition-all whitespace-nowrap ${activeTab === 'roster' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={18} /> <span>學員名冊</span>
        </button>
        <button 
          onClick={() => setActiveTab('points')}
          className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black transition-all whitespace-nowrap ${activeTab === 'points' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <GraduationCap size={18} /> <span>成績評定</span>
        </button>
        <button 
          onClick={() => setActiveTab('scan')}
          className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black transition-all whitespace-nowrap ${activeTab === 'scan' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Camera size={18} /> <span>掃描核銷</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <HistoryIcon size={18} /> <span>兌換日誌</span>
        </button>
      </div>

      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
           {students.map(student => {
             const rank = getRank(student.totalEarned);
             return (
               <div key={student.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                 <div className={`absolute top-0 right-0 w-24 h-24 ${rank.color} opacity-5 -translate-y-12 translate-x-12 rounded-full`}></div>
                 <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${rank.color}`}></div>
                      <img src={student.avatar} className={`w-24 h-24 rounded-full border-4 border-white shadow-2xl relative z-10 object-cover`} alt={student.name} />
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-xl z-20 border border-slate-50`}>
                        {rank.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-800 mb-1">{student.name}</h3>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-6 ${rank.color} shadow-sm`}>
                      {rank.name}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                       <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">可用點數</p>
                          <p className="text-xl font-black text-indigo-600">{student.points.toLocaleString()}</p>
                       </div>
                       <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-50">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">總累積</p>
                          <p className="text-xl font-black text-amber-600">{student.totalEarned.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">ID: {student.id.replace('user_', '')}</span>
                    <button 
                      onClick={() => {
                        setTargetStudentId(student.id);
                        setActiveTab('points');
                      }}
                      className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1"
                    >
                      <Award size={14} /> 發放點數
                    </button>
                 </div>
               </div>
             );
           })}
        </div>
      )}

      {activeTab === 'points' && (
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl animate-in slide-in-from-bottom-4">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                <Gift size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">學員點數發放系統</h2>
                <p className="text-slate-400 font-medium">針對特定學員的優異表現，手動核發獎勵點數。</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">第一步：選擇受獎學員</label>
                  <div className="grid grid-cols-3 gap-4">
                    {students.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setTargetStudentId(s.id)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${targetStudentId === s.id ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'}`}
                      >
                        <img src={s.avatar} className="w-12 h-12 rounded-full shadow-sm" alt={s.name} />
                        <span className={`font-black text-sm ${targetStudentId === s.id ? 'text-indigo-600' : 'text-slate-600'}`}>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">第二步：發放名目</label>
                  <select 
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700 shadow-inner"
                  >
                    <option>期中考試成績優異</option>
                    <option>課堂專題報告表現亮眼</option>
                    <option>作業提前完成並獲得 A++</option>
                    <option>熱心助人、品格優秀</option>
                    <option>數學周考 80 分以上</option>
                    <option>國文段考 90 分以上</option>
                    <option>特殊貢獻獎勵</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">第三步：調整點數金額</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={pointAmount}
                      onChange={e => setPointAmount(e.target.value)}
                      className="w-full p-8 text-5xl font-black bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-indigo-600 shadow-inner"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                       <span className="font-black text-slate-300 text-2xl uppercase tracking-tighter">PTS</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleIssuePoints}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-8 rounded-[2rem] transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-4 text-2xl active:scale-95 group"
                >
                  <Check size={32} className="group-hover:scale-125 transition-transform" />
                  確認核發獎勵
                </button>
              </div>
           </div>
        </div>
      )}

      {/* 剩餘分頁邏輯保持不變，但適配 UI 風格 */}
      {activeTab === 'scan' && (
        <div className="bg-white rounded-[3rem] p-16 border border-slate-100 text-center shadow-xl animate-in fade-in">
           <div className="bg-indigo-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
             <Camera size={56} />
           </div>
           <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">啟動兌換掃描器</h2>
           <p className="text-slate-400 mb-12 font-medium max-w-md mx-auto leading-relaxed">請掃描學員手機顯示的兌換 QR Code，系統將即時比對資料庫並完成核銷動作。</p>
           <button 
              onClick={handleStartScan}
              disabled={isScanning}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-16 py-6 rounded-[2rem] font-black transition-all shadow-2xl shadow-indigo-200 inline-flex items-center justify-center gap-4 text-xl active:scale-95"
            >
              {isScanning ? '正在啟動相機...' : '開始掃描條碼'}
            </button>
        </div>
      )}

      {activeTab === 'history' && (
        <section className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-black text-2xl text-slate-800 flex items-center gap-3">
              <HistoryIcon className="text-indigo-600" />
              全體兌換日誌
            </h2>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="搜尋學生、商品或流水號..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm w-full md:w-96 shadow-inner font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">狀態</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">學員</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">兌換商品</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">扣點</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">日期</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRedemptions.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6 whitespace-nowrap">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {r.status === 'completed' ? '已核銷' : r.status === 'pending' ? '待處理' : '已取消'}
                      </span>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap font-black text-slate-800">
                      {students.find(s => s.id === r.userId)?.name || '未知學員'}
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap font-bold text-slate-600">{r.productName}</td>
                    <td className="px-10 py-6 whitespace-nowrap text-indigo-600 font-black">{r.pointsSpent} PTS</td>
                    <td className="px-10 py-6 whitespace-nowrap text-slate-400 text-sm font-bold">
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap">
                      {r.status === 'pending' ? (
                        <button 
                          onClick={() => handleConfirmRedemption(r.id)}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl shadow-indigo-100 active:scale-95"
                        >
                          立即核銷
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] tracking-widest">
                          <Check size={14} /> FINISHED
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 掃描對話框邏輯同前，但適配視覺 */}
      {isScanning && (
        <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8">
          <div className="relative w-full max-w-lg aspect-square border-8 border-white/5 rounded-[5rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)]">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 flex items-center justify-center">
               <div className="text-center">
                 <ScanLine size={140} className="mx-auto mb-10 animate-pulse text-indigo-400" />
                 <p className="text-3xl font-black text-white mb-4 tracking-tight">搜尋有效條碼中...</p>
                 <p className="text-indigo-300 font-bold tracking-widest uppercase text-xs">AI Computer Vision Active</p>
               </div>
             </div>
             <div className="absolute top-0 left-0 w-full h-3 bg-indigo-400 shadow-[0_0_50px_rgba(129,140,248,1)] animate-scan-line"></div>
          </div>
          <button 
            onClick={() => setIsScanning(false)}
            className="mt-16 bg-white/5 hover:bg-white/10 text-white px-12 py-5 rounded-[2rem] font-black transition-all border border-white/10 flex items-center gap-4 text-lg backdrop-blur"
          >
            <X size={24} /> 取消掃描
          </button>
          <style>{`
            @keyframes scan-line {
              0% { top: 0% }
              100% { top: 100% }
            }
            .animate-scan-line {
              animation: scan-line 3s linear infinite;
            }
          `}</style>
        </div>
      )}

      {scanResult && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-2xl">
          <div className="bg-white rounded-[4rem] max-w-md w-full p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-10 mx-auto shadow-inner">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 text-center mb-10 tracking-tight">驗證成功！</h2>
            
            <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 mb-12 border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">申請學員</span>
                <span className="font-black text-slate-800 text-xl">{students.find(s => s.id === scanResult.userId)?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">兌換項目</span>
                <span className="font-black text-slate-800 text-xl">{scanResult.productName}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">核銷點數</span>
                <span className="font-black text-indigo-600 text-2xl">{scanResult.pointsSpent} <span className="text-xs font-bold text-indigo-400">PTS</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleConfirmRedemption(scanResult.id)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 text-xl active:scale-95"
              >
                <Check size={28} />
                確認發放獎勵
              </button>
              <button 
                onClick={() => setScanResult(null)}
                className="w-full bg-slate-100 text-slate-600 font-bold py-5 rounded-2xl hover:bg-slate-200 transition-all text-lg"
              >
                稍後處理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
