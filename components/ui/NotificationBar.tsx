'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Language } from '@/types';

interface Notification {
  id: string;
  type: 'new_assessment' | 'new_gig' | 'critical_case' | 'system';
  title: string;
  message: string;
  link?: string;
  created_at: string;
  read: boolean;
}

interface NotificationBarProps {
  lang?: Language;
}

export default function NotificationBar({ lang = 'en' }: NotificationBarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessments',
        },
        () => {
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gigs',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Get recent critical assessments
      const { data: criticalAssessments } = await supabase
        .from('assessments')
        .select('id, name, severity_score, created_at')
        .eq('severity_score', 'Critical')
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent gigs
      const { data: recentGigs } = await supabase
        .from('gigs')
        .select('id, name, gig_type, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      const notifs: Notification[] = [];

      // Add critical cases
      criticalAssessments?.forEach((assessment) => {
        notifs.push({
          id: `critical_${assessment.id}`,
          type: 'critical_case',
          title: 'Critical Case Reported',
          message: `${assessment.name} reported critical damage`,
          link: `/admin/verify?id=${assessment.id}`,
          created_at: assessment.created_at,
          read: false,
        });
      });

      // Add new gigs
      recentGigs?.forEach((gig) => {
        notifs.push({
          id: `gig_${gig.id}`,
          type: 'new_gig',
          title: gig.gig_type === 'donate' ? 'New Donation' : 'New Collection Request',
          message: `${gig.name} posted a ${gig.gig_type === 'donate' ? 'donation' : 'collection request'}`,
          link: `/gigs`,
          created_at: gig.created_at,
          read: false,
        });
      });

      // Sort by date
      notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifs => 
      notifs.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(count => Math.max(0, count - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifs => notifs.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm bg-white rounded-lg shadow-xl z-50 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

