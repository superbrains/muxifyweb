import React, { useEffect, useState } from 'react';
import {
    Dialog,
    Button,
    Text,
    VStack,
    HStack,
    Box,
    Icon,
    IconButton,
    Spinner,
    Flex,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { LyricsField } from './LyricsField';
import { uploadMusicService } from '../services/uploadMusicService';
import { validateLyrics } from '../lib/lyricsFormat';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@shared/lib/errorUtils';

interface EditLyricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    trackTitle?: string;
    /** Called after a successful save or remove, e.g. to refresh the list. */
    onSaved?: () => void;
}

/**
 * Add or edit lyrics for an already-uploaded track. Prefills from the track's
 * current lyrics (the owner's track detail now returns them) and saves through
 * the existing PUT/DELETE lyrics endpoints. Reuses the same {@link LyricsField}
 * as the upload form so the editing experience is identical.
 */
export const EditLyricsModal: React.FC<EditLyricsModalProps> = ({
    isOpen,
    onClose,
    trackId,
    trackTitle,
    onSaved,
}) => {
    const toast = useChakraToast();
    const [value, setValue] = useState('');
    const [initial, setInitial] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fieldError, setFieldError] = useState<string | undefined>(undefined);

    // Load the track's current lyrics each time the modal opens.
    useEffect(() => {
        if (!isOpen || !trackId) return;
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        setFieldError(undefined);

        uploadMusicService
            .getTrack(trackId)
            .then((track) => {
                if (cancelled) return;
                const lrc = track.lrcContent ?? '';
                setValue(lrc);
                setInitial(lrc);
            })
            .catch((err) => {
                if (cancelled) return;
                setLoadError(getApiErrorMessage(err, "Couldn't load this track's lyrics."));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, trackId]);

    const hadLyrics = initial.trim().length > 0;
    const dirty = value !== initial;

    const handleSave = async () => {
        const err = validateLyrics(value);
        if (err) {
            setFieldError(err);
            return;
        }

        setSaving(true);
        try {
            if (value.trim()) {
                await uploadMusicService.updateTrackLyrics(trackId, value);
                toast.success('Lyrics saved', trackTitle ? `Updated lyrics for “${trackTitle}”.` : undefined);
            } else if (hadLyrics) {
                // Field cleared on a track that had lyrics → remove them.
                await uploadMusicService.deleteTrackLyrics(trackId);
                toast.success('Lyrics removed');
            }
            onSaved?.();
            onClose();
        } catch (e) {
            toast.error('Save failed', getApiErrorMessage(e, "Couldn't save lyrics."));
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        try {
            await uploadMusicService.deleteTrackLyrics(trackId);
            toast.success('Lyrics removed');
            onSaved?.();
            onClose();
        } catch (e) {
            toast.error('Remove failed', getApiErrorMessage(e, "Couldn't remove lyrics."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="640px" w="92vw" p={6} borderRadius="20px" position="relative">
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        position="absolute"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <VStack align="stretch" gap={4} pt={1}>
                        <Box pr={8}>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Edit lyrics
                            </Text>
                            {trackTitle && (
                                <Text fontSize="13px" color="gray.500" truncate>
                                    {trackTitle}
                                </Text>
                            )}
                        </Box>

                        {loading ? (
                            <Flex align="center" justify="center" py={12}>
                                <Spinner color="primary.500" />
                            </Flex>
                        ) : loadError ? (
                            <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={4}>
                                <Text fontSize="13px" color="red.600">
                                    {loadError}
                                </Text>
                            </Box>
                        ) : (
                            <LyricsField
                                value={value}
                                onChange={(v) => {
                                    setValue(v);
                                    if (fieldError) setFieldError(undefined);
                                }}
                                error={fieldError}
                                rows={12}
                            />
                        )}

                        <HStack justify="space-between" pt={1}>
                            <Box>
                                {hadLyrics && !loading && !loadError && (
                                    <Button
                                        variant="ghost"
                                        color="red.500"
                                        size="sm"
                                        fontSize="13px"
                                        disabled={saving}
                                        onClick={handleRemove}
                                        _hover={{ bg: 'red.50' }}
                                    >
                                        Remove lyrics
                                    </Button>
                                )}
                            </Box>
                            <HStack gap={3}>
                                <Button
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="13px"
                                    disabled={saving}
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="13px"
                                    _hover={{ bg: 'primary.600' }}
                                    onClick={handleSave}
                                    disabled={saving || loading || !!loadError || !dirty}
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                >
                                    {saving && <Spinner size="sm" color="white" />}
                                    Save lyrics
                                </Button>
                            </HStack>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
