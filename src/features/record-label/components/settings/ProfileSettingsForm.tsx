import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Image,
    Input,
    Text,
    VStack,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import {
    FaFacebook,
    FaInstagram,
    FaSpotify,
    FaTiktok,
    FaTwitter,
    FaYoutube,
} from 'react-icons/fa';
import { FiCamera, FiGlobe } from 'react-icons/fi';
import { CountryStateSelect } from '@shared/components/CountryStateSelect';
import {
    useUpdateLabelProfile,
    useUploadLabelLogo,
} from '../../hooks/useLabelSettings';
import type {
    LabelSettingsDto,
    UpdateLabelProfileRequest,
} from '../../types';

interface FormState {
    legalName: string;
    tradingName: string;
    natureOfBusiness: string;
    registrationNumber: string;
    website: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    socials: {
        twitter: string;
        instagram: string;
        youTube: string;
        spotify: string;
        tikTok: string;
        facebook: string;
    };
}

interface FormErrors {
    legalName?: string;
    natureOfBusiness?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
}

const URL_RE = /^https?:\/\/[^\s]+$/i;

const fromDto = (dto: LabelSettingsDto): FormState => ({
    legalName: dto.legalName ?? '',
    tradingName: dto.tradingName ?? '',
    natureOfBusiness: dto.natureOfBusiness ?? '',
    registrationNumber: dto.registrationNumber ?? '',
    website: dto.website ?? '',
    address: {
        street: dto.address?.street ?? '',
        city: dto.address?.city ?? '',
        state: dto.address?.state ?? '',
        country: dto.address?.country ?? '',
        postalCode: dto.address?.postalCode ?? '',
    },
    socials: {
        twitter: dto.socialLinks?.twitter ?? '',
        instagram: dto.socialLinks?.instagram ?? '',
        youTube: dto.socialLinks?.youTube ?? '',
        spotify: dto.socialLinks?.spotify ?? '',
        tikTok: dto.socialLinks?.tikTok ?? '',
        facebook: dto.socialLinks?.facebook ?? '',
    },
});

const equal = (a: FormState, b: FormState) =>
    JSON.stringify(a) === JSON.stringify(b);

interface ProfileSettingsFormProps {
    settings: LabelSettingsDto;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
    settings,
}) => {
    const initial = useMemo(() => fromDto(settings), [settings]);
    const [form, setForm] = useState<FormState>(initial);
    const [errors, setErrors] = useState<FormErrors>({});
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const updateProfile = useUpdateLabelProfile();
    const uploadLogo = useUploadLabelLogo();

    useEffect(() => {
        setForm(initial);
        setErrors({});
    }, [initial]);

    const dirty = !equal(form, initial);

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    const setAddress = <K extends keyof FormState['address']>(
        key: K,
        value: FormState['address'][K],
    ) =>
        setForm((p) => ({
            ...p,
            address: { ...p.address, [key]: value },
        }));

    const setSocial = <K extends keyof FormState['socials']>(
        key: K,
        value: FormState['socials'][K],
    ) =>
        setForm((p) => ({
            ...p,
            socials: { ...p.socials, [key]: value },
        }));

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!form.legalName.trim()) next.legalName = 'Legal name is required';
        if (!form.natureOfBusiness.trim())
            next.natureOfBusiness = 'Nature of business is required';
        if (!form.address.street.trim()) next.street = 'Street is required';
        if (!form.address.city.trim()) next.city = 'City is required';
        if (!form.address.state.trim()) next.state = 'State is required';
        if (!form.address.country.trim()) next.country = 'Country is required';
        if (form.website.trim() && !URL_RE.test(form.website.trim())) {
            next.website = 'Website must be a valid URL (https://…)';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const trimOrNull = (v: string) => {
            const t = v.trim();
            return t.length ? t : undefined;
        };

        const req: UpdateLabelProfileRequest = {
            legalName: form.legalName.trim(),
            tradingName: trimOrNull(form.tradingName),
            natureOfBusiness: form.natureOfBusiness.trim(),
            registrationNumber: trimOrNull(form.registrationNumber),
            address: {
                street: form.address.street.trim(),
                city: form.address.city.trim(),
                state: form.address.state.trim(),
                country: form.address.country.trim(),
                postalCode: trimOrNull(form.address.postalCode),
            },
            website: trimOrNull(form.website),
            socialLinks: {
                twitter: trimOrNull(form.socials.twitter),
                instagram: trimOrNull(form.socials.instagram),
                youTube: trimOrNull(form.socials.youTube),
                spotify: trimOrNull(form.socials.spotify),
                tikTok: trimOrNull(form.socials.tikTok),
                facebook: trimOrNull(form.socials.facebook),
            },
        };

        await updateProfile.mutateAsync(req);
    };

    const handleDiscard = () => {
        setForm(initial);
        setErrors({});
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            // surfaced via toast inside the mutation; we still want a hard guard
            // before hitting the network for very obvious cases
            alert('Logo must be under 5 MB.');
            e.target.value = '';
            return;
        }
        uploadLogo.mutate(file, {
            onSettled: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <Box position="relative" pb={dirty ? '80px' : 0}>
            <VStack align="stretch" gap={8}>
                {/* Logo */}
                <Section title="Logo" subtitle="Square PNG/JPG/WebP, up to 5 MB.">
                    <HStack gap={4} align="center">
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="16px"
                            bg="gray.100"
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="1px solid"
                            borderColor="gray.200"
                            flexShrink={0}
                        >
                            {settings.logoUrl ? (
                                <Image
                                    src={settings.logoUrl}
                                    alt="Label logo"
                                    w="full"
                                    h="full"
                                    objectFit="cover"
                                />
                            ) : (
                                <Icon as={FiCamera} boxSize="24px" color="gray.400" />
                            )}
                        </Box>
                        <VStack align="start" gap={2}>
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="gray.900"
                                color="white"
                                _hover={{ bg: 'gray.800' }}
                                borderRadius="8px"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadLogo.isPending}
                            >
                                {uploadLogo.isPending ? (
                                    <HStack gap={2}>
                                        <Spinner size="xs" />
                                        <span>Uploading…</span>
                                    </HStack>
                                ) : settings.logoUrl ? (
                                    'Replace logo'
                                ) : (
                                    'Upload logo'
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                style={{ display: 'none' }}
                                onChange={handleLogoChange}
                            />
                            <Text fontSize="11px" color="gray.500">
                                Used on receipts, accept-invite emails, and your public page.
                            </Text>
                        </VStack>
                    </HStack>
                </Section>

                {/* Company details */}
                <Section
                    title="Company details"
                    subtitle="Legal information used for contracts and payouts."
                >
                    <VStack align="stretch" gap={4}>
                        <Field
                            label="Legal name"
                            required
                            error={errors.legalName}
                            value={form.legalName}
                            onChange={(v) => setField('legalName', v)}
                            placeholder="As registered with CAC"
                        />
                        <HStack gap={4} align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                            <Field
                                label="Trading name"
                                value={form.tradingName}
                                onChange={(v) => setField('tradingName', v)}
                                placeholder="Brand or stage name (optional)"
                            />
                            <Field
                                label="Registration number"
                                value={form.registrationNumber}
                                onChange={(v) => setField('registrationNumber', v)}
                                placeholder="e.g. RC123456"
                            />
                        </HStack>
                        <Field
                            label="Nature of business"
                            required
                            error={errors.natureOfBusiness}
                            value={form.natureOfBusiness}
                            onChange={(v) => setField('natureOfBusiness', v)}
                            placeholder="e.g. Independent record label, music publishing"
                        />
                        <Field
                            label="Website"
                            value={form.website}
                            onChange={(v) => setField('website', v)}
                            placeholder="https://…"
                            error={errors.website}
                            leftIcon={<Icon as={FiGlobe} color="gray.400" />}
                        />
                    </VStack>
                </Section>

                {/* Address */}
                <Section title="Registered address" subtitle="Where the company is legally based.">
                    <VStack align="stretch" gap={4}>
                        <Field
                            label="Street"
                            required
                            error={errors.street}
                            value={form.address.street}
                            onChange={(v) => setAddress('street', v)}
                            placeholder="e.g. 36 Aladdin St"
                        />
                        <HStack gap={4} align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                            <Field
                                label="City"
                                required
                                error={errors.city}
                                value={form.address.city}
                                onChange={(v) => setAddress('city', v)}
                                placeholder="e.g. Lekki"
                            />
                            <Field
                                label="Postal code"
                                value={form.address.postalCode}
                                onChange={(v) => setAddress('postalCode', v)}
                                placeholder="Optional"
                            />
                        </HStack>
                        <Box>
                            <CountryStateSelect
                                countryValue={form.address.country}
                                stateValue={form.address.state}
                                onCountryChange={(c) => setAddress('country', c)}
                                onStateChange={(s) => setAddress('state', s)}
                                countryError={errors.country}
                                stateError={errors.state}
                            />
                        </Box>
                    </VStack>
                </Section>

                {/* Socials */}
                <Section
                    title="Social media"
                    subtitle="Optional links shown on your public label page."
                >
                    <VStack align="stretch" gap={3}>
                        <SocialField
                            icon={FaTwitter}
                            placeholder="https://x.com/yourlabel"
                            value={form.socials.twitter}
                            onChange={(v) => setSocial('twitter', v)}
                        />
                        <SocialField
                            icon={FaInstagram}
                            placeholder="https://instagram.com/yourlabel"
                            value={form.socials.instagram}
                            onChange={(v) => setSocial('instagram', v)}
                        />
                        <SocialField
                            icon={FaYoutube}
                            placeholder="https://youtube.com/@yourlabel"
                            value={form.socials.youTube}
                            onChange={(v) => setSocial('youTube', v)}
                        />
                        <SocialField
                            icon={FaSpotify}
                            placeholder="https://open.spotify.com/…"
                            value={form.socials.spotify}
                            onChange={(v) => setSocial('spotify', v)}
                        />
                        <SocialField
                            icon={FaTiktok}
                            placeholder="https://tiktok.com/@yourlabel"
                            value={form.socials.tikTok}
                            onChange={(v) => setSocial('tikTok', v)}
                        />
                        <SocialField
                            icon={FaFacebook}
                            placeholder="https://facebook.com/yourlabel"
                            value={form.socials.facebook}
                            onChange={(v) => setSocial('facebook', v)}
                        />
                    </VStack>
                </Section>
            </VStack>

            {/* Sticky save bar */}
            {dirty && (
                <Box
                    position="sticky"
                    bottom={0}
                    mt={6}
                    py={3}
                    px={4}
                    bg="white"
                    borderTop="1px solid"
                    borderColor="gray.200"
                    borderRadius="12px"
                    boxShadow="0 -4px 16px rgba(0,0,0,0.04)"
                    zIndex={2}
                >
                    <HStack justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.600">
                            You have unsaved changes.
                        </Text>
                        <HStack gap={2}>
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                onClick={handleDiscard}
                                disabled={updateProfile.isPending}
                            >
                                Discard
                            </Button>
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                _hover={{ bg: 'primary.600' }}
                                onClick={handleSubmit}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <HStack gap={2}>
                                        <Spinner size="xs" />
                                        <span>Saving…</span>
                                    </HStack>
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </HStack>
                    </HStack>
                </Box>
            )}
        </Box>
    );
};

// ---- internal building blocks ----

const Section: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
    <Box>
        <Box mb={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {title}
            </Text>
            {subtitle && (
                <Text fontSize="11px" color="gray.500">
                    {subtitle}
                </Text>
            )}
        </Box>
        {children}
    </Box>
);

const Field: React.FC<{
    label: string;
    required?: boolean;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}> = ({ label, required, value, onChange, placeholder, error, leftIcon }) => (
    <Box flex={1} minW={0}>
        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
            {label}
            {required && (
                <Text as="span" color="red.500">
                    {' '}
                    *
                </Text>
            )}
        </Text>
        <HStack
            gap={2}
            bg="gray.50"
            borderRadius="8px"
            px={3}
            borderWidth="1px"
            borderColor={error ? 'red.300' : 'gray.200'}
            _focusWithin={{ borderColor: 'primary.500' }}
        >
            {leftIcon}
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                variant="subtle"
                size="sm"
                fontSize="xs"
                bg="transparent"
                border="none"
                px={0}
                _focus={{ boxShadow: 'none' }}
            />
        </HStack>
        {error && (
            <Text color="red.500" fontSize="11px" mt={1}>
                {error}
            </Text>
        )}
    </Box>
);

const SocialField: React.FC<{
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}> = ({ icon, placeholder, value, onChange }) => (
    <HStack
        gap={2}
        bg="gray.50"
        borderRadius="8px"
        px={3}
        borderWidth="1px"
        borderColor="gray.200"
        _focusWithin={{ borderColor: 'primary.500' }}
    >
        <Icon as={icon} color="gray.500" boxSize="14px" />
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            variant="subtle"
            size="sm"
            fontSize="xs"
            bg="transparent"
            border="none"
            px={0}
            _focus={{ boxShadow: 'none' }}
        />
    </HStack>
);
