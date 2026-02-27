"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface DoctorNotification {
  $id: string;
  doctorName: string;
  type: string;
  title: string;
  message: string;
  appointmentId: string | null;
  isRead: boolean;
  createdAt: string;
}

export const DoctorNotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<DoctorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/doctor?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error("Error loading doctor notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: DoctorNotification) => {
    if (!notification.isRead) {
      await fetch("/api/notifications/doctor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId: notification.$id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.$id === notification.$id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await fetch("/api/notifications/doctor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notificări"
        >
          <Image
            src="/assets/icons/bell.svg"
            height={24}
            width={24}
            alt="notificări"
            className="size-6"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[500px] w-80 overflow-y-auto border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-100">Notificări</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Marchează toate ca citite
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Se încarcă...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Nu aveți notificări
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.$id}
                className={`cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
                asChild
              >
                <Link
                  href={
                    notification.type === "appointment_reminder_1h" || notification.type === "appointment_reminder_24h"
                      ? "/doctor"
                      : notification.appointmentId
                        ? `/doctor/messages?appointmentId=${notification.appointmentId}`
                        : "/doctor/messages"
                  }
                  className="flex items-start gap-3 w-full"
                >
                  <Image
                    src={
                      notification.type === "appointment_reminder_1h" || notification.type === "appointment_reminder_24h"
                        ? "/assets/icons/calendar.svg"
                        : "/assets/icons/file-text.svg"
                    }
                    height={20}
                    width={20}
                    alt={notification.type?.startsWith("appointment_reminder") ? "reminder" : "mesaj"}
                    className={`mt-0.5 flex-shrink-0 ${
                      notification.type?.startsWith("appointment_reminder") ? "text-amber-600 dark:text-amber-400" : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          !notification.isRead ? "text-slate-700 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      {formatDateTime(notification.createdAt).relativeTime ||
                        formatDateTime(notification.createdAt).dateTime}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="p-2">
          <Link
            href="/doctor/messages"
            prefetch={false}
            className="block py-2 text-center text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            onClick={() => setOpen(false)}
          >
            Vezi toate mesajele
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
