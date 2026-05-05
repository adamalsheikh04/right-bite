import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";

function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      title: "Daily Goal Reached! 🎉",
      message: "Great job! You've successfully hit your calorie target for today.",
      timestamp: "2 hours ago",
      isUnread: true,
    },
    {
      id: 2,
      title: "Meal Log Reminder",
      message: "Don't forget to log your lunch to keep your macros on track.",
      timestamp: "5 hours ago",
      isUnread: true,
    },
    {
      id: 3,
      title: "Weekly Plan Ready",
      message: "Your new personalized weekly meal plan has been generated.",
      timestamp: "1 day ago",
      isUnread: false,
    },
    {
      id: 4,
      title: "Welcome to Right Bite! 🌿",
      message: "We're excited to help you on your nutrition journey. Start by filling out your profile.",
      timestamp: "2 days ago",
      isUnread: false,
    },
  ]);

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Notifications
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Stay updated with your latest alerts and reminders.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notifications.map((notification) => (
            <Card key={notification.id} style={{ padding: "1.25rem", position: "relative" }}>
              {notification.isUnread && (
                <div style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)"
                }} />
              )}
              <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: "var(--text-h)", fontWeight: 600 }}>
                {notification.title}
              </h3>
              <p style={{ margin: "0 0 1rem", color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                {notification.message}
              </p>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                {notification.timestamp}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default NotificationsPage;
