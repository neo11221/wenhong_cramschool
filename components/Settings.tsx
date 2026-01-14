import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { useAlert } from './AlertProvider';
import { saveUser } from '../utils/storage';

interface SettingsProps {
    user: UserProfile;
    onUserUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
    const { showAlert } = useAlert();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 100 * 1024) { // 100KB limit
            showAlert('檔案太大囉！請選擇小於 100KB 的圖片', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            showAlert('這不是圖片喔！請選擇 JPG 或 PNG 檔案', 'error');
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = reader.result as string;

                // Save to Firestore
                const updatedUser = { ...user, avatar: base64String };
                await saveUser(updatedUser);
                onUserUpdate();

                showAlert('頭貼更換成功！看起來真棒！', 'success');
            } catch (error) {
                console.error('Error updating avatar:', error);
                showAlert('更換失敗，請稍後再試', 'error');
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleResetAvatar = async () => {
        if (!confirm('確定要換回原本的可愛頭貼嗎？')) return;

        try {
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&mouth=smile`;
            const updatedUser = { ...user, avatar: defaultAvatar };
            await saveUser(updatedUser);
            onUserUpdate();
            showAlert('已恢復預設頭貼！', 'success');
        } catch (error) {
            console.error('Error resetting avatar:', error);
            showAlert('重置失敗，請稍後再試', 'error');
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <Sparkles className="text-indigo-500" />
                    個人設定
                </h1>
                <p className="text-slate-500 mt-1 font-medium">打造專屬於你的個人風格</p>
            </header>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover relative z-10"
                        />
                        <label className="absolute bottom-0 right-0 z-20 cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <div className="bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition-colors shadow-lg hover:scale-105 active:scale-95">
                                <Camera size={20} />
                            </div>
                        </label>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-wider">{user.role === 'ADMIN' ? '管理員' : '學員'}</p>
                    </div>

                    <div className="w-full max-w-sm space-y-4 pt-6 mt-6 border-t border-slate-50">
                        <label className="block w-full cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <div className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-transparent hover:border-indigo-200">
                                <Upload size={20} />
                                {isUploading ? '上傳中...' : '上傳新頭貼'}
                            </div>
                        </label>

                        <button
                            onClick={handleResetAvatar}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            重置為預設頭貼
                        </button>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 text-xs font-bold text-amber-600/80 leading-relaxed text-center max-w-sm">
                        💡 小提醒：建議使用正方形圖片，檔案大小請小於 100KB 喔！
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
