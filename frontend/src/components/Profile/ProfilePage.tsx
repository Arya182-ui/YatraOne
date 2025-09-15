import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storage, ref, getDownloadURL, uploadBytesResumable } from '../../lib/firebase-storage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

import { userSettingsAPI } from '../../lib/api';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [language, setLanguage] = useState(i18n.language || 'en');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');
    const [phone, setPhone] = useState('');
    const [showImageUrl, setShowImageUrl] = useState(false);
    const [copied, setCopied] = useState(false);
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [city, setCity] = useState('');
    const [stateVal, setStateVal] = useState('');
    const [zip, setZip] = useState('');
    const [notificationPrefs, setNotificationPrefs] = useState<any>({});
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [twofaOtp, setTwofaOtp] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTimeLeft, setUploadTimeLeft] = useState<string | null>(null);

    // Handle image file upload (must be inside component to access user/setPhotoUrl)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }
        if (!user || !user.id) {
            toast.error('User not found. Please re-login.');
            console.error('User object missing or missing id:', user);
            return;
        }
    setUploading(true);
    setUploadProgress(0);
    setUploadTimeLeft(null);
    setShowImageUrl(false);
        try {
            const storageRef = ref(storage, `profile_photos/${user.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            let startTime = Date.now();
            uploadTask.on('state_changed',
                (snapshot: any) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                    // Estimate time left
                    const elapsed = (Date.now() - startTime) / 1000; // seconds
                    const speed = snapshot.bytesTransferred / elapsed; // bytes/sec
                    const remaining = snapshot.totalBytes - snapshot.bytesTransferred;
                    if (speed > 0 && remaining > 0) {
                        const secondsLeft = remaining / speed;
                        setUploadTimeLeft(secondsLeft > 1 ? `${Math.round(secondsLeft)} sec` : '<1 sec');
                    } else {
                        setUploadTimeLeft(null);
                    }
                },
                (err: any) => {
                    setUploading(false);
                    setUploadProgress(0);
                    setUploadTimeLeft(null);
                    setShowImageUrl(false);
                    console.error('Image upload error:', err);
                    toast.error('Failed to upload image. Check console for details.');
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    setPhotoUrl(url);
                    await userSettingsAPI.updateProfilePhoto(user.id, url);
                    toast.success('Profile photo uploaded!');
                    setUploading(false);
                    setUploadProgress(0);
                    setUploadTimeLeft(null);
                    setShowImageUrl(true);
                    setCopied(false);
                    setTimeout(() => setShowImageUrl(false), 7000);
                }
            );
        } catch (err) {
            setUploading(false);
            setUploadProgress(0);
            setUploadTimeLeft(null);
            setShowImageUrl(false);
            console.error('Image upload error:', err);
            toast.error('Failed to upload image. Check console for details.');
        }
    };

    useEffect(() => {
        if (!user) return;

        api.get(`/users/${user.id}/profile`).then(res => {
            const data = res.data;
            setEmail(data.email || '');
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setPhotoUrl(data.photoUrl || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setDob(data.dob || '');
            setGender(data.gender || '');
            setCity(data.city || '');
            setStateVal(data.state || '');
            setZip(data.zip || '');
            setTwoFAEnabled(data.twoFAEnabled ?? false);
            setLanguage(data.language || i18n.language || 'en');
        });
        userSettingsAPI.getActivityLog(user.id).then(setActivityLog).catch(() => setActivityLog([]));
        userSettingsAPI.loadSettings(user.id).then(settings => setNotificationPrefs(settings.notifications || {})).catch(() => setNotificationPrefs({}));
    }, [user]);
    // Debounced 2FA toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedToggle2FA = useCallback(
        debounce(async () => {
            if (!user) return;
            setTwoFALoading(true);
            try {
                const newStatus = !twoFAEnabled;
                await userSettingsAPI.toggle2FA(user.id, newStatus);
                setTwoFAEnabled(newStatus);
                toast.success(newStatus ? t('2FA enabled!') : t('2FA disabled!'));
            } catch {
                toast.error(t('Failed to update 2FA status'));
            }
            setTwoFALoading(false);
        }, 500, { leading: true, trailing: false }),
        [user, twoFAEnabled, t]
    );
    const handleToggle2FA = () => {
        if (!twoFALoading) debouncedToggle2FA();
    };

    // Debounced profile save
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedProfileSave = useCallback(
        debounce(async () => {
            if (!user) return;
            setLoading(true);
            try {
                await userSettingsAPI.saveProfile(user.id, { firstName, lastName, email, language });
                i18n.changeLanguage(language);
                toast.success('Profile updated!');
            } catch {
                toast.error('Failed to update profile');
            }
            setLoading(false);
        }, 500, { leading: true, trailing: false }),
        [user, firstName, lastName, email, language, i18n]
    );
    const handleProfileSave = () => {
        if (!loading) debouncedProfileSave();
    };

    const debouncedPasswordReset = useCallback(
        debounce(async () => {
            if (!user) return;
            setLoading(true);
            try {
                await userSettingsAPI.resetPassword(user.id, currentPassword, newPassword);
                toast.success('Password updated!');
                setCurrentPassword('');
                setNewPassword('');
            } catch {
                toast.error('Failed to update password');
            }
            setLoading(false);
        }, 500, { leading: true, trailing: false }),
        [user, currentPassword, newPassword]
    );
    const handlePasswordReset = () => {
        if (!currentPassword || !newPassword) {
            toast.error('Please fill both current and new password fields.');
            return;
        }
        if (!loading) debouncedPasswordReset();
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 animate-fade-in">
            {/* Animated glassy gradient background, like dashboard */}
            <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-96 bg-gradient-to-r from-blue-300/30 via-purple-300/20 to-pink-300/30 blur-3xl animate-gradient-wave rounded-full"></div>
                {[...Array(18)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full opacity-40 animate-pulse"
                        style={{
                            width: `${12 + Math.random() * 16}px`,
                            height: `${12 + Math.random() * 16}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: `radial-gradient(circle at 50% 50%, #fff7, #fff0 70%)`,
                            filter: 'blur(1.5px)',
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>
            <div className="max-w-5xl mx-auto mt-8 px-1 md:px-0 relative z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Sidebar Card */}
                    <div className="w-full md:w-1/3 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 py-6 px-3 mb-4 md:mb-0">
                        <div className="relative group mb-2">
                            <img
                                src={photoUrl || '/avatar-default.png'}
                                alt="Profile"
                                className="w-36 h-36 rounded-full object-cover border-4 border-blue-400 shadow-2xl transition-transform group-hover:scale-105 bg-gray-100 dark:bg-gray-800 ring-4 ring-white dark:ring-gray-900"
                                style={{ boxShadow: '0 6px 32px 0 rgba(80,80,180,0.12)' }}
                            />
                            <button
                                className="absolute bottom-2 right-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full p-2 shadow-md cursor-pointer hover:scale-110 transition"
                                title={t('Upload Photo')}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <span className="material-symbols-rounded text-lg">upload</span>
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            {uploading && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] w-44 flex flex-col items-center z-10">
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                                        <div
                                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-700 dark:text-gray-200">
                                        {t('Uploading...')} {uploadProgress.toFixed(0)}% {uploadTimeLeft && `| ${t('Time left')}: ${uploadTimeLeft}`}
                                    </div>
                                </div>
                            )}
                            {showImageUrl && photoUrl && (
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4.5rem] w-64 flex flex-col items-center z-20 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl shadow-lg p-2 animate-fade-in">
                                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">{t('Image uploaded!')}</div>
                                    <img src={photoUrl} alt="Uploaded preview" className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 mb-1" />
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 border border-gray-300 dark:border-gray-700 w-36 overflow-x-auto"
                                            value={photoUrl}
                                            readOnly
                                            style={{ fontSize: '10px' }}
                                        />
                                        <button
                                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            onClick={() => {
                                                navigator.clipboard.writeText(photoUrl);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1500);
                                            }}
                                        >{copied ? t('Copied!') : t('Copy Link')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Remove manual URL input and update button, now handled by upload */}
                        <div className="mt-3 text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{firstName} {lastName}</div>
                            <div className="material-symbols-rounded text-base align-middle">{email}</div>
                            <div className="mt-2 text-blue-600 dark:text-blue-300 font-medium flex items-center justify-center gap-1">
                                <span className="material-symbols-rounded text-base align-middle">Mo. </span>
                                {phone || <span className="text-gray-400">{t('No phone')}</span>}
                            </div>
                        </div>
                    </div>
                    {/* Main Content Card */}
                    <div className="w-full md:w-2/3 flex flex-col gap-4">
                        {/* ...existing code... */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('First Name')}</label>
                                <input
                                    className="input-modern w-full"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder={t('Enter your first name')}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Last Name')}</label>
                                <input
                                    className="input-modern w-full"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder={t('Enter your last name')}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Email')}</label>
                                <input
                                    className="input-modern w-full opacity-70 cursor-not-allowed"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t('Enter your email')}
                                    disabled
                                />
                            </div>
                        </div>
                        {/* Removed duplicate email field for cleaner UI */}
                        {/* Phone */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Phone')}</label>
                                <input
                                    className="input-modern w-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder={t('Enter your phone')}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow hover:from-blue-600 hover:to-purple-600 transition font-semibold text-base"
                                    onClick={useCallback(debounce(async () => {
                                        if (!user) return;
                                        try {
                                            await userSettingsAPI.updatePhone(user.id, phone);
                                            toast.success('Phone updated!');
                                        } catch {
                                            toast.error('Failed to update phone');
                                        }
                                    }, 500, { leading: true, trailing: false }), [user, phone])}
                                    disabled={loading}
                                >
                                    <span className="material-symbols-rounded align-middle mr-1 text-base">
                                        {t('Update Phone')}</span>
                                </button>
                            </div>
                        </div>
                        {/* Address/Details */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Address')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={address} onChange={e => setAddress(e.target.value)} placeholder={t('Address')} />
                            </div>
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('City')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={city} onChange={e => setCity(e.target.value)} placeholder={t('City')} />
                            </div>
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('State')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder={t('State')} />
                            </div>
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('ZIP')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={zip} onChange={e => setZip(e.target.value)} placeholder={t('ZIP')} />
                            </div>
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Date of Birth')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={dob} onChange={e => setDob(e.target.value)} placeholder={t('Date of Birth')} />
                            </div>
                            <div>
                                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Gender')}</label>
                                <input className="input-modern w-full mb-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm" value={gender} onChange={e => setGender(e.target.value)} placeholder={t('Gender')} />
                            </div>
                        </div>
                        <button
                            className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition font-semibold w-fit self-end tracking-wide text-base"
                            onClick={useCallback(debounce(async () => {
                                if (!user) return;
                                try {
                                    await userSettingsAPI.updateDetails(user.id, { address, city, state: stateVal, zip, dob, gender });
                                    toast.success('Details updated!');
                                } catch {
                                    toast.error('Failed to update details');
                                }
                            }, 500, { leading: true, trailing: false }), [user, address, city, stateVal, zip, dob, gender])}
                            disabled={loading}
                        >
                            <span className="material-symbols-rounded align-middle mr-1 text-base">
                                {t('Update Details')}</span>
                        </button>
                        <div>
                            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{t('Language')}</label>
                            <select
                                className="input-modern w-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="pa">ਪੰਜਾਬੀ</option>
                            </select>
                        </div>
                        <button
                            className="mt-6 px-12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition font-bold text-lg w-fit self-end flex items-center gap-3 tracking-tight"
                            onClick={handleProfileSave}
                            disabled={loading}
                        >
                            <span className="material-symbols-rounded text-xl">
                                {t('Save Profile')}</span>
                        </button>
                    </div>
                </div>
                <hr className="my-12 border-blue-200 dark:border-blue-900" />
                {/* Notification Preferences */}
                <div className="bg-white/70 dark:bg-gray-900/70 rounded-2xl px-8 py-8 shadow-lg border border-blue-100 dark:border-blue-900 mb-12">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <span className="material-symbols-rounded text-2xl">
                            {t('Notification Preferences')}</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!notificationPrefs.email} onChange={e => {
                                setNotificationPrefs((p: any) => ({ ...p, email: e.target.checked }));
                            }} className="accent-blue-500 w-5 h-5" />
                            <span>{t('Email Notifications')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!notificationPrefs.sms} onChange={e => {
                                setNotificationPrefs((p: any) => ({ ...p, sms: e.target.checked }));
                            }} className="accent-blue-500 w-5 h-5" />
                            <span>{t('SMS Notifications')}</span>
                        </label>
                        <button
                            className="mt-3 px-7 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition font-semibold w-fit tracking-wide text-base"
                            onClick={useCallback(debounce(async () => {
                                if (!user) return;
                                try {
                                    await userSettingsAPI.updateNotificationPreferences(user.id, notificationPrefs);
                                    toast.success('Notification preferences updated!');
                                } catch {
                                    toast.error('Failed to update notification preferences');
                                }
                            }, 500, { leading: true, trailing: false }), [user, notificationPrefs])}
                            disabled={loading}
                        >
                            <span className="material-symbols-rounded align-middle mr-1 text-base">
                                {t('Save Preferences')}</span>
                        </button>
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/70 rounded-2xl px-8 py-8 shadow-lg border border-purple-100 dark:border-purple-900 mb-12">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <span className="material-symbols-rounded text-2xl">
                            {t('Two-Factor Authentication')}</span>
                    </h3>
                    <div className="flex items-center gap-6">
                        <span className={twoFAEnabled ? 'text-green-500 font-semibold flex items-center gap-1' : 'text-gray-400 flex items-center gap-1'}>
                            <span className="material-symbols-rounded text-lg">{twoFAEnabled ? 'verified_user' : 'lock'}</span>
                            {twoFAEnabled ? t('Enabled') : t('Disabled')}
                        </span>
                        <button
                            className={`px-8 py-2.5 rounded-full transition text-white font-semibold shadow-2xl ${twoFAEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} ${twoFALoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            onClick={handleToggle2FA}
                            disabled={twoFALoading}
                        >
                            <span className="material-symbols-rounded align-middle mr-1 text-base">
                                {twoFAEnabled ? t('Disable 2FA') : t('Enable 2FA')}</span>
                        </button>
                    </div>
                </div>
                {/* Activity Log */}
                <div className="bg-white/70 dark:bg-gray-900/70 rounded-2xl px-8 py-8 shadow-lg border border-pink-100 dark:border-pink-900 mb-12">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
                        <span className="material-symbols-rounded text-2xl">
                            {t('Activity Log')} </span>
                    </h3>
                    <div className="bg-gradient-to-br from-gray-100/80 to-blue-100/60 dark:from-gray-800/80 dark:to-blue-900/60 rounded-xl p-5 max-h-40 overflow-y-auto shadow-inner border border-gray-200 dark:border-gray-800">
                        {activityLog.length === 0 && <div className="text-gray-400">No activity yet.</div>}
                        {activityLog.map((log, i) => (
                            <div key={i} className="text-sm mb-1 flex items-center gap-2">
                                <span className="material-symbols-rounded text-base text-blue-400">event</span>
                                <span className="font-medium">{log.type}</span>
                                <span className="text-gray-500">— {log.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/70 rounded-2xl px-8 py-8 shadow-lg border border-green-100 dark:border-green-900 mb-12">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
                        <span className="material-symbols-rounded text-2xl">
                            {t('Reset Password')} </span>
                    </h3>
                    <form className="flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handlePasswordReset(); }} autoComplete="off">
                        <input
                            className="input-modern bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder={t('Current Password')}
                            autoComplete="current-password"
                        />
                        <input
                            className="input-modern bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder={t('New Password')}
                            autoComplete="new-password"
                        />
                        <button
                            type="submit"
                            className="mt-4 px-12 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl shadow-2xl hover:from-green-700 hover:to-blue-700 transition font-bold text-lg w-fit self-end flex items-center gap-3 tracking-tight"
                            disabled={loading}
                        >
                            <span className="material-symbols-rounded text-xl">
                                {t('Update Password')}</span>
                        </button>
                    </form>
                    {/* Delete Account button and modal moved here */}
                    <div className="mt-8 bg-white/70 dark:bg-gray-900/70 rounded-2xl px-5 py-6 shadow-lg border border-red-200 dark:border-red-800">
                        <button
                            className="px-10 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl shadow-2xl hover:from-red-700 hover:to-pink-700 transition font-bold text-lg flex items-center gap-3 tracking-tight"
                            onClick={() => setDeleteModal(true)}
                        >
                            <span className="material-symbols-rounded text-xl">
                                {t('Delete My Account')}</span>
                        </button>
                        {deleteModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                                <div className="bg-white dark:bg-gray-900 px-10 py-12 rounded-3xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-800 relative flex flex-col gap-6">
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white rounded-full p-3 shadow-lg animate-bounce">
                                    </span>
                                    <h4 className="text-xl font-bold mb-2 text-red-600 text-center tracking-tight">{t('Confirm Account Deletion')}</h4>
                                    {/* Masked email display */}
                                    <p className="mb-1 text-gray-700 dark:text-gray-300 text-center text-sm">
                                        {(() => {
                                            if (!email) return null;
                                            const [name, domain] = email.split('@');
                                            if (!name || !domain) return null;
                                            let masked = name;
                                            if (name.length > 4) {
                                                masked = name.slice(0, 2) + '*'.repeat(name.length - 4) + name.slice(-2);
                                            } else if (name.length > 2) {
                                                masked = name[0] + '*'.repeat(name.length - 2) + name.slice(-1);
                                            } else {
                                                masked = name[0] + '*';
                                            }
                                            return `OTP will be sent to: ${masked}@${domain}`;
                                        })()}
                                    </p>
                                    <button
                                        className="mb-3 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow hover:from-blue-600 hover:to-purple-600 transition font-semibold text-base"
                                        onClick={async () => {
                                            try {
                                                if (!user) return;
                                                await userSettingsAPI.sendDeleteAccountOtp(user.id);
                                                toast.success(t('OTP sent to your email.'));
                                            } catch {
                                                toast.error(t('Failed to send OTP.'));
                                            }
                                        }}
                                    >
                                        {t('Send OTP')}
                                    </button>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">Enter OTPs sent to your email and 2FA app to confirm account deletion.</p>
                                    <input
                                        className="input-modern mb-2 w-full text-center focus:ring-2 focus:ring-red-400/60 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                                        value={emailOtp}
                                        onChange={e => setEmailOtp(e.target.value)}
                                        placeholder={t('Email OTP')}
                                    />
                                    {twoFAEnabled && (
                                        <input
                                            className="input-modern mb-2 w-full text-center focus:ring-2 focus:ring-red-400/60 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                                            value={twofaOtp}
                                            onChange={e => setTwofaOtp(e.target.value)}
                                            placeholder={t('2FA OTP')}
                                        />
                                    )}
                                    <div className="flex gap-4 mt-4 justify-center">
                                        <button
                                            className="px-5 py-2 bg-gray-300 dark:bg-gray-700 rounded shadow hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                                            onClick={() => setDeleteModal(false)}
                                            disabled={deleteLoading}
                                        >{t('Cancel')}</button>
                                        <button
                                            className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded shadow-lg hover:from-red-700 hover:to-pink-700 transition font-semibold tracking-wide"
                                            disabled={deleteLoading}
                                            onClick={async () => {
                                                setDeleteLoading(true);
                                                try {
                                                    if (!user) return;
                                                    await userSettingsAPI.deleteAccount(user.id, emailOtp, twofaOtp);
                                                    toast.success('Account deleted.');
                                                    setTimeout(() => window.location.href = '/login', 1500);
                                                } catch (e: any) {
                                                    toast.error(e?.response?.data?.detail || 'Failed to delete account');
                                                }
                                                setDeleteLoading(false);
                                            }}
                                        >
                                            <span className="material-symbols-rounded align-middle mr-1 text-base">delete_forever</span>
                                            {t('Confirm Delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
