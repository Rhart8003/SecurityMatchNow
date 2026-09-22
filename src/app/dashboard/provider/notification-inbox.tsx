"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  request_id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

export function ProviderNotificationInbox({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter((item) => !item.read_at).length;

  async function markRead(id: string) {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from("provider_notifications").update({ read_at: now }).eq("id", id);
    if (!error) {
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: now } : item));
    }
  }

  if (!notifications.length) return null;

  return (
    <section className="notification-inbox">
      <div className="notification-inbox-head">
        <div><span className="eyebrow">LEAD ALERTS</span><h2>Provider notifications</h2></div>
        <span className="notification-count">{unread} unread</span>
      </div>
      <div className="notification-list">
        {notifications.slice(0, 8).map((item) => (
          <article className={`notification-row ${item.read_at ? "" : "unread"}`} key={item.id}>
            <div>
              <b>{item.title}</b>
              <p>{item.message}</p>
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <div className="notification-actions">
              <Link href={`/dashboard/provider/lead/${item.request_id}`} className="text-link">View lead</Link>
              {!item.read_at && <button type="button" onClick={() => markRead(item.id)}>Mark read</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
