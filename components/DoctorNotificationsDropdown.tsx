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
          className="relative p-2 hover:bg-dark-50"
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
        className="w-80 max-h-[500px] overflow-y-auto bg-white border-dark-200"
      >
        <div className="flex items-center justify-between p-3 border-b border-dark-200">
          <h3 className="text-16-semibold text-dark-700">Notificări</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-12-medium text-green-500 hover:text-green-600"
            >
              Marchează toate ca citite
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-14-regular text-dark-500">
            Se încarcă...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-14-regular text-dark-500">
            Nu aveți notificări
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.$id}
                className={`p-3 cursor-pointer hover:bg-dark-50 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
                asChild
              >
                <Link
                  href={
                    notification.appointmentId
                      ? `/admin/messages?appointmentId=${notification.appointmentId}`
                      : "/admin/messages"
                  }
                  className="flex items-start gap-3 w-full"
                >
                  <Image
                    src="/assets/icons/file-text.svg"
                    height={20}
                    width={20}
                    alt="mesaj"
                    className="mt-0.5 flex-shrink-0 text-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-14-semibold ${
                          !notification.isRead ? "text-dark-700" : "text-dark-600"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-12-regular text-dark-500 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-11-regular text-dark-400 mt-1">
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
            href="/admin/messages"
            className="block text-center text-14-medium text-green-500 hover:text-green-600 py-2"
            onClick={() => setOpen(false)}
          >
            Vezi toate mesajele
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
