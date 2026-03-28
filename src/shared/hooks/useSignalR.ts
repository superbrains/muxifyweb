import { useEffect, useCallback, useState, useRef } from 'react';
import {
  signalRService,
  type ConnectionState,
  type SignalREventHandlers,
} from '@shared/services/signalRService';
import type { RealTimeNotificationDto } from '@/features/notifications/types';

interface UseSignalROptions {
  /** Whether to automatically connect when the hook mounts */
  autoConnect?: boolean;
  /** Callback when a new notification is received */
  onNotification?: (notification: RealTimeNotificationDto) => void;
  /** Callback when unread count is updated */
  onUnreadCountUpdated?: (unreadCount: number) => void;
  /** Callback when notifications are marked as read */
  onNotificationsMarkedRead?: (notificationIds: string[]) => void;
}

interface UseSignalRReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether currently connected */
  isConnected: boolean;
  /** Connect to SignalR hub */
  connect: () => Promise<void>;
  /** Disconnect from SignalR hub */
  disconnect: () => Promise<void>;
  /** Acknowledge a notification */
  acknowledgeNotification: (notificationId: string) => Promise<void>;
  /** Subscribe to a notification type */
  subscribeToType: (type: string) => Promise<void>;
  /** Unsubscribe from a notification type */
  unsubscribeFromType: (type: string) => Promise<void>;
}

/**
 * React hook for managing SignalR notifications connection
 */
export function useSignalR(options: UseSignalROptions = {}): UseSignalRReturn {
  const {
    autoConnect = true,
    onNotification,
    onUnreadCountUpdated,
    onNotificationsMarkedRead,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    signalRService.getConnectionState()
  );

  // Store callbacks in refs to avoid re-registering handlers on every render
  const onNotificationRef = useRef(onNotification);
  const onUnreadCountUpdatedRef = useRef(onUnreadCountUpdated);
  const onNotificationsMarkedReadRef = useRef(onNotificationsMarkedRead);

  // Update refs when callbacks change
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    onUnreadCountUpdatedRef.current = onUnreadCountUpdated;
  }, [onUnreadCountUpdated]);

  useEffect(() => {
    onNotificationsMarkedReadRef.current = onNotificationsMarkedRead;
  }, [onNotificationsMarkedRead]);

  // Set up event handlers
  useEffect(() => {
    const handlers: SignalREventHandlers = {
      onReceiveNotification: (notification) => {
        onNotificationRef.current?.(notification as RealTimeNotificationDto);
      },
      onUnreadCountUpdated: (data) => {
        onUnreadCountUpdatedRef.current?.(data.unreadCount);
      },
      onNotificationsMarkedRead: (data) => {
        onNotificationsMarkedReadRef.current?.(data.notificationIds);
      },
      onConnectionStateChanged: (state) => {
        setConnectionState(state);
      },
    };

    signalRService.setHandlers(handlers);

    return () => {
      // Don't clear handlers on unmount as other components may still need them
      // signalRService.clearHandlers();
    };
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      signalRService.connect().catch(console.error);
    }

    // Cleanup on unmount - only disconnect if no other components are using it
    return () => {
      // We don't disconnect here because other components may still be using the connection
      // The connection should be managed at the app level or explicitly disconnected
    };
  }, [autoConnect]);

  const connect = useCallback(async () => {
    await signalRService.connect();
  }, []);

  const disconnect = useCallback(async () => {
    await signalRService.disconnect();
  }, []);

  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    await signalRService.acknowledgeNotification(notificationId);
  }, []);

  const subscribeToType = useCallback(async (type: string) => {
    await signalRService.subscribeToType(type);
  }, []);

  const unsubscribeFromType = useCallback(async (type: string) => {
    await signalRService.unsubscribeFromType(type);
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    acknowledgeNotification,
    subscribeToType,
    unsubscribeFromType,
  };
}
