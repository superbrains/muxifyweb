import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Switch,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { settingsService } from '../services/settingsService';
import type { UserNotificationPreferencesDto } from '../types';
import {
  getSettingsByCategory,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationCategory,
} from '../types';

interface PreferenceSectionProps {
  title: string;
  description: string;
  category: NotificationCategory;
  preferences: UserNotificationPreferencesDto;
  onToggle: (key: keyof UserNotificationPreferencesDto, value: boolean) => void;
  isUpdating: string | null;
}

const PreferenceSection: React.FC<PreferenceSectionProps> = ({
  title,
  description,
  category,
  preferences,
  onToggle,
  isUpdating,
}) => {
  const settings = getSettingsByCategory(category);

  return (
    <Box>
      <VStack align="start" gap={1} mb={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
          {title}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {description}
        </Text>
      </VStack>
      <VStack align="stretch" gap={3}>
        {settings.map((setting) => (
          <HStack
            key={setting.key}
            justify="space-between"
            p={3}
            bg="gray.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                {setting.label}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {setting.description}
              </Text>
            </VStack>
            <HStack gap={2}>
              {isUpdating === setting.key && (
                <Spinner size="sm" color="primary.500" />
              )}
              <Switch.Root
                colorPalette="primary"
                size="md"
                checked={preferences[setting.key]}
                onCheckedChange={(details) => onToggle(setting.key, details.checked)}
                disabled={isUpdating === setting.key}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export const NotificationsTab: React.FC = () => {
  const [preferences, setPreferences] = useState<UserNotificationPreferencesDto>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await settingsService.getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (key: keyof UserNotificationPreferencesDto, value: boolean) => {
    try {
      setIsUpdating(key);
      setError(null);
      // Optimistically update UI
      setPreferences((prev) => ({ ...prev, [key]: value }));
      // Send update to server
      const updated = await settingsService.togglePreference(key, value);
      setPreferences(updated);
    } catch (err) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      setError(err instanceof Error ? err.message : 'Failed to update preference');
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <VStack py={8}>
        <Spinner size="lg" color="primary.500" />
        <Text fontSize="sm" color="gray.500">
          Loading notification preferences...
        </Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="start" gap={1}>
        <Text fontSize="md" fontWeight="semibold" color="gray.900">
          Notification Preferences
        </Text>
        <Text fontSize="xs" color="gray.600">
          Control how and when you receive notifications
        </Text>
      </VStack>

      {error && (
        <Alert.Root status="error" borderRadius="md">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      )}

      <PreferenceSection
        title="Email Notifications"
        description="Notifications sent to your email address"
        category="email"
        preferences={preferences}
        onToggle={handleToggle}
        isUpdating={isUpdating}
      />

      <PreferenceSection
        title="Push Notifications"
        description="Notifications sent to your device"
        category="push"
        preferences={preferences}
        onToggle={handleToggle}
        isUpdating={isUpdating}
      />

      <PreferenceSection
        title="In-App Notifications"
        description="Notifications displayed within the app"
        category="inApp"
        preferences={preferences}
        onToggle={handleToggle}
        isUpdating={isUpdating}
      />
    </VStack>
  );
};
