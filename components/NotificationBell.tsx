"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`;
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  return "Just now";
}

const typeIcons: Record<string, string> = {
  order_confirmation: "\u{1F4E6}",
  payment_received: "\u2705",
  order_processing: "\u2699\uFE0F",
  order_shipped: "\u{1F69A}",
  order_delivered: "\u{1F389}",
  order_cancelled: "\u274C",
  order_refunded: "\u{1F4B0}",
  low_stock_alert: "\u26A0\uFE0F",
  general: "\u{1F4E2}",
  announcement: "\u{1F4E3}",
  referral: "\u{1F91D}",
};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function NotificationBell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check for session cookie
  useEffect(() => {
    setIsAuthenticated(!!getCookie("mm-session"));
  }, []);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/account?action=notifications&limit=10&offset=0");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      }
      if (typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // API may not exist yet — gracefully show empty state
    }
  }, []);

  // Fetch unread count periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/account?action=notifications&countOnly=1");
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Silently fail
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchNotifications();
    }
  }, [open, isAuthenticated, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const count = unreadCount || 0;

  const markRead = async (id: string) => {
    try {
      await fetch("/api/account?action=markNotificationRead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silently fail
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/account?action=markAllNotificationsRead", {
        method: "POST",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-foreground hover:text-primary h-9 w-9 relative inline-flex items-center justify-center rounded-md transition-colors"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-[10px] bg-red-500 text-white font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground tracking-wide">
              Notifications
            </h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                disabled={markingAll}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-foreground/30 mb-2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border hover:bg-muted transition-colors cursor-pointer ${
                    !n.isRead ? "bg-muted" : ""
                  }`}
                  onClick={() => {
                    if (!n.isRead) markRead(n.id);
                  }}
                >
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {typeIcons[n.type] || "\u{1F4E2}"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            !n.isRead
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.content}
                      </p>
                      <p className="text-[10px] text-foreground/30 mt-1">
                        {formatTimeAgo(new Date(n.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border text-center">
              <Link
                href="/account"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
