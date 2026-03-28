import * as signalR from '@microsoft/signalr';
import { tokenStorage } from '@app/lib/axiosInstance';

const SIGNALR_HUB_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://localhost:7084';
const NOTIFICATIONS_HUB = `${SIGNALR_HUB_URL}/hubs/notifications`;

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface SignalREventHandlers {
  onReceiveNotification?: (notification: unknown) => void;
  onUnreadCountUpdated?: (data: { unreadCount: number }) => void;
  onNotificationsMarkedRead?: (data: { notificationIds: string[] }) => void;
  onConnectionStateChanged?: (state: ConnectionState) => void;
}

/**
 * SignalR connection manager for real-time notifications
 */
class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private handlers: SignalREventHandlers = {};
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  /**
   * Gets the current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Checks if currently connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Sets up event handlers for SignalR events
   */
  setHandlers(handlers: SignalREventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Clears all event handlers
   */
  clearHandlers(): void {
    this.handlers = {};
  }

  /**
   * Establishes connection to the notification hub
   */
  async connect(): Promise<void> {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      console.warn('[SignalR] No auth token available, skipping connection');
      return;
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected');
      return;
    }

    // Stop existing connection if any
    if (this.connection) {
      await this.disconnect();
    }

    this.updateConnectionState('connecting');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATIONS_HUB, {
        accessTokenFactory: () => tokenStorage.getAccessToken() || '',
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Custom retry delays: 0s, 2s, 5s, 10s, 30s
          const delays = [0, 2000, 5000, 10000, 30000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up connection event handlers
    this.setupConnectionEvents();

    // Set up message handlers
    this.setupMessageHandlers();

    try {
      await this.connection.start();
      console.log('[SignalR] Connected to notification hub');
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      this.updateConnectionState('disconnected');
      throw error;
    }
  }

  /**
   * Disconnects from the notification hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('[SignalR] Disconnected from notification hub');
      } catch (error) {
        console.error('[SignalR] Error during disconnect:', error);
      } finally {
        this.connection = null;
        this.updateConnectionState('disconnected');
      }
    }
  }

  /**
   * Acknowledges receipt of a notification
   */
  async acknowledgeNotification(notificationId: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('[SignalR] Cannot acknowledge notification - not connected');
      return;
    }

    try {
      await this.connection!.invoke('AcknowledgeNotification', notificationId);
    } catch (error) {
      console.error('[SignalR] Failed to acknowledge notification:', error);
    }
  }

  /**
   * Subscribes to a specific notification type
   */
  async subscribeToType(notificationType: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('[SignalR] Cannot subscribe - not connected');
      return;
    }

    try {
      await this.connection!.invoke('SubscribeToType', notificationType);
      console.log(`[SignalR] Subscribed to notification type: ${notificationType}`);
    } catch (error) {
      console.error('[SignalR] Failed to subscribe to type:', error);
    }
  }

  /**
   * Unsubscribes from a specific notification type
   */
  async unsubscribeFromType(notificationType: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('[SignalR] Cannot unsubscribe - not connected');
      return;
    }

    try {
      await this.connection!.invoke('UnsubscribeFromType', notificationType);
      console.log(`[SignalR] Unsubscribed from notification type: ${notificationType}`);
    } catch (error) {
      console.error('[SignalR] Failed to unsubscribe from type:', error);
    }
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.log('[SignalR] Reconnecting...', error);
      this.updateConnectionState('reconnecting');
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected with connection ID:', connectionId);
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.log('[SignalR] Connection closed', error);
      this.updateConnectionState('disconnected');

      // Attempt manual reconnect if automatic reconnect failed
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          console.log('[SignalR] Attempting manual reconnect...');
          this.connect().catch(console.error);
        }, 5000);
      }
    });
  }

  private setupMessageHandlers(): void {
    if (!this.connection) return;

    // Handle new notification received
    this.connection.on('ReceiveNotification', (notification: unknown) => {
      console.log('[SignalR] Received notification:', notification);
      this.handlers.onReceiveNotification?.(notification);
    });

    // Handle unread count update
    this.connection.on('UnreadCountUpdated', (data: { unreadCount: number }) => {
      console.log('[SignalR] Unread count updated:', data.unreadCount);
      this.handlers.onUnreadCountUpdated?.(data);
    });

    // Handle notifications marked as read
    this.connection.on('NotificationsMarkedRead', (data: { notificationIds: string[] }) => {
      console.log('[SignalR] Notifications marked read:', data.notificationIds);
      this.handlers.onNotificationsMarkedRead?.(data);
    });
  }

  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.handlers.onConnectionStateChanged?.(state);
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
