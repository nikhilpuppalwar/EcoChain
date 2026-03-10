import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [settings, setSettings] = useState({
        platformName: 'EcoChain',
        reportingPeriod: 'quarterly',
        sessionTimeout: 30,
        minPasswordLength: 10,
        twoFARequired: true,
        annualDeadline: '2025-03-31',
        quarterlyDeadlines: 'Q4: Jan 31 | Q1: Apr 30 | Q2: Jul 31 | Q3: Oct 31',
    });

    const handleSave = () => toast.success('Settings saved successfully!');

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Platform Settings</h1>
                <p className="text-gray-400 text-sm mt-1">General, security, and reporting configuration</p>
            </div>

            {/* General */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-black text-gray-900 border-b border-gray-100 pb-3">General Settings</h2>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Platform Name</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-50">
                    <div>
                        <p className="font-black text-gray-900">Maintenance Mode</p>
                        <p className="text-xs text-gray-400">Disable platform access for all non-admin users</p>
                    </div>
                    <button
                        onClick={() => { setMaintenanceMode(!maintenanceMode); toast(maintenanceMode ? 'Maintenance mode OFF' : '⚠️ Maintenance mode ON — only admins can login', { icon: '🔧' }); }}
                        className={`relative w-14 h-7 rounded-full transition-colors ${maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${maintenanceMode ? 'translate-x-7' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Reporting periods */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-black text-gray-900 border-b border-gray-100 pb-3">Reporting Period Config</h2>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Reporting Frequency</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.reportingPeriod} onChange={e => setSettings({ ...settings, reportingPeriod: e.target.value })}>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual Only</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Annual Report Deadline</label>
                    <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.annualDeadline} onChange={e => setSettings({ ...settings, annualDeadline: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Quarterly Deadlines</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.quarterlyDeadlines} onChange={e => setSettings({ ...settings, quarterlyDeadlines: e.target.value })} />
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-black text-gray-900 border-b border-gray-100 pb-3">Security Settings</h2>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Minimum Password Length</label>
                    <input type="number" min={8} max={24} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.minPasswordLength} onChange={e => setSettings({ ...settings, minPasswordLength: parseInt(e.target.value) })} />
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1.5">Session Timeout (minutes)</label>
                    <input type="number" min={15} max={120} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={settings.sessionTimeout} onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-50">
                    <div>
                        <p className="font-black text-gray-900">Require 2FA</p>
                        <p className="text-xs text-gray-400">Enforce TOTP two-factor for all government and admin users</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, twoFARequired: !settings.twoFARequired })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.twoFARequired ? 'bg-[#1A7A4A]' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.twoFARequired ? 'translate-x-7' : ''}`} />
                    </button>
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-[#1A7A4A] text-white font-black py-4 rounded-2xl hover:bg-[#15613b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1A7A4A]/20">
                <span className="material-symbols-outlined text-sm">save</span>
                Save All Settings
            </button>
        </div>
    );
}
