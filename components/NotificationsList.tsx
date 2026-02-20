"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";
import { Button } from "./ui/button";

interface Notification {
  $id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  appointmentId: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

export function NotificationsList({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(userId),
        getUnreadNotificationCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;
    await markNotificationAsRead(notification.$id);
    setNotifications((prev) =>
      prev.map((n) => (n.$id === notification.$id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
        return "/assets/icons/check-circle.svg";
      case "appointment_cancelled":
        return "/assets/icons/x-circle.svg";
      case "analysis_results_ready":
        return "/assets/icons/file-text.svg";
      case "appointment_reminder":
        return "/assets/icons/calendar.svg";
      case "appointment_created":
        return "/assets/icons/clock.svg";
      case "consultation_added":
        return "/assets/icons/file-text.svg";
      case "slot_available_assigned":
        return "/assets/icons/check-circle.svg";
      default:
        return "/assets/icons/bell.svg";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
        return "text-green-600";
      case "appointment_cancelled":
        return "text-red-600";
      case "analysis_results_ready":
        return "text-blue-600";
      case "appointment_reminder":
        return "text-yellow-600";
      case "appointment_created":
        return "text-gray-600";
      case "consultation_added":
        return "text-purple-600";
      case "slot_available_assigned":
        return "text-green-600";
      default:
        return "text-dark-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-14-regular text-dark-500">Se încarcă notificările...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dark-200 bg-white p-8 text-center">
        <Image
          src="/assets/icons/bell.svg"
          height={48}
          width={48}
          alt="notificări"
          className="mx-auto mb-4 opacity-50"
        />
        <p className="text-16-medium text-dark-700">Nu aveți notificări</p>
        <p className="text-14-regular text-dark-500 mt-1">
          Când vei primi notificări despre programări sau rezultate, le vei vedea aici.
        </p>
        <Link href={`/patients/${userId}/dashboard`}>
          <Button variant="outline" className="mt-6">
            Înapoi la Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-14-regular text-dark-600">
          {notifications.length} notificări
          {unreadCount > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              ({unreadCount} necitite)
            </span>
          )}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-14-medium text-green-500 hover:text-green-600 hover:bg-green-50"
          >
            Marchează toate ca citite
          </Button>
        )}
      </div>

      <ul className="divide-y divide-dark-100 rounded-xl border border-dark-200 bg-white overflow-hidden">
        {notifications.map((notification) => (
          <li
            key={notification.$id}
            className={`transition-colors ${
              !notification.isRead ? "bg-blue-50/50" : "bg-white"
            } hover:bg-dark-50/50`}
          >
            <button
              type="button"
              onClick={() => handleMarkAsRead(notification)}
              className="flex w-full items-start gap-4 p-4 text-left"
            >
              <Image
                src={getNotificationIcon(notification.type)}
                height={24}
                width={24}
                alt=""
                className={`mt-0.5 flex-shrink-0 ${getNotificationColor(
                  notification.type
                )}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-15-semibold ${
                      !notification.isRead ? "text-dark-800" : "text-dark-600"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-14-regular text-dark-600 mt-1 whitespace-pre-wrap">
                  {notification.message}
                </p>
                <p className="text-12-regular text-dark-400 mt-2">
                  {formatDateTime(notification.createdAt).relativeTime ||
                    formatDateTime(notification.createdAt).dateTime}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
