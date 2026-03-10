import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Notifications() {
    const { user } = useAuthStore();

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'alert', title: 'Action Required: Pending Verification', message: 'Your latest emission report (Q1 2024) has been flagged for review. Please provide additional utility bills as proof.', date: '2 hours ago', read: false },
        { id: 2, type: 'success', title: 'Credits Issued Successfully', message: '5,000 CCR have been minted and deposited into your wallet for the Rajasthan Solar Project.', date: '1 day ago', read: false },
        { id: 3, type: 'info', title: 'System Update', message: 'The AI Verification model has been updated to v2.1. Processing times are now 40% faster.', date: '3 days ago', read: true },
        { id: 4, type: 'warning', title: 'Approaching Emission Cap', message: 'Warning: Your reported emissions are currently at 85% of your annual cap. Consider purchasing offsets.', date: '1 week ago', read: true },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">Stay updated with alerts, reports, and system messages.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">notifications_off</span>
                        <h3 className="text-lg font-bold text-slate-600 mb-1">No notifications</h3>
                        <p className="text-sm">You're all caught up! New alerts will appear here.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <li key={notif.id} className={`p-4 sm:p-6 transition-colors hover:bg-slate-50 flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                <div className="shrink-0 mt-1">
                                    {notif.type === 'alert' && <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><span className="material-symbols-outlined">error</span></div>}
                                    {notif.type === 'success' && <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><span className="material-symbols-outlined">check_circle</span></div>}
                                    {notif.type === 'info' && <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined">info</span></div>}
                                    {notif.type === 'warning' && <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><span className="material-symbols-outlined">warning</span></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-800 font-extrabold' : 'text-slate-700'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{notif.date}</span>
                                    </div>
                                    <p className={`text-sm ${!notif.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="shrink-0 text-slate-300 hover:text-red-500 transition-colors p-1"
                                    title="Dismiss"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
