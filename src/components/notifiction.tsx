import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/aceternity/animated-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle, Clock } from "lucide-react";

// Define the Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Define Button props interface
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Basic Button component
const Button = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false, 
  type = 'button' 
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

const NotificationsModal = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/notifications/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notifications");
      }

      const data: Notification[] = await response.json();
      console.log(data);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <Modal>
      <ModalTrigger >
        <Button onClick={fetchNotifications}>
          <Bell className="h-4 w-4" />
          Notifications
        </Button>
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Notifications</h3>
              <div>
                {notifications.length} Notifications
              </div>
            </div>

            {loading ? (
              <div>Loading notifications...</div>
            ) : error ? (
              <div>
                {error}
              </div>
            ) : (
              <div>
                {notifications.length === 0 ? (
                  <Card>
                    <CardContent>
                      No notifications to display
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => (
                    <Card key={notification.id}>
                      <CardContent>
                        <div>
                          <div>
                            {notification.read ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p>{notification.title}</p>
                            <p>
                              {notification.message}
                            </p>
                            <div>
                              <span>
                                {new Date(notification.timestamp).toLocaleDateString()}
                              </span>
                              {!notification.read && (
                                <Button
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={() => window.location.href = '/notifications'}
          >
            View All Notifications
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};

export default NotificationsModal;