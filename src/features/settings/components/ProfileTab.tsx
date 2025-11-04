import React, { useState, useEffect } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Input,
    Button,
    Grid,
} from '@chakra-ui/react';
import { Select } from '@/shared/components/Select';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { toaster } from '@/components/ui/toaster';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';

export const ProfileTab: React.FC = () => {
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const userData = getCurrentUserData();
    const userType = getCurrentUserType();
    
    // Initialize form data from store or defaults
    const getInitialFormData = () => {
        if (!userData) {
            return {
                fullName: '',
                performingName: '',
                email: '',
                residentialAddress: '',
                userType: '',
                location: '',
                recordLabel: '',
            };
        }
        
        if (userType === 'artist') {
            const artistData = userData as any;
            return {
                fullName: artistData.fullName || '',
                performingName: artistData.performingName || '',
                email: artistData.email || '',
                residentialAddress: artistData.residentAddress || '',
                userType: artistData.userType === 'artist' ? 'Artist'
                    : artistData.userType === 'musician' ? 'Musician'
                    : artistData.userType === 'creator' ? 'Creator'
                    : artistData.userType === 'dj' ? 'DJ'
                    : artistData.userType === 'podcaster' ? 'Podcaster'
                    : 'Artist',
                location: `${artistData.state || ''}, ${artistData.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || '',
                recordLabel: artistData.recordLabel || '',
            };
        } else if (userType === 'company') {
            const companyData = userData as any;
            return {
                fullName: companyData.legalCompanyName || '',
                performingName: companyData.companyName || '',
                email: companyData.email || '',
                residentialAddress: companyData.companyAddress || '',
                userType: companyData.userType === 'record_label' ? 'Record Label'
                    : companyData.userType === 'distribution' ? 'Distribution Company'
                    : companyData.userType === 'publisher' ? 'Music Publisher'
                    : companyData.userType === 'management' ? 'Management Company'
                    : 'Company',
                location: `${companyData.state || ''}, ${companyData.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || '',
                recordLabel: '',
            };
        } else if (userType === 'ad-manager') {
            const adManagerData = userData as any;
            return {
                fullName: adManagerData.fullName || '',
                performingName: '',
                email: adManagerData.email || '',
                residentialAddress: adManagerData.residentAddress || '',
                userType: 'Ad Manager',
                location: `${adManagerData.state || ''}, ${adManagerData.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || '',
                recordLabel: '',
            };
        }
        
        return {
            fullName: '',
            performingName: '',
            email: '',
            residentialAddress: '',
            userType: '',
            location: '',
            recordLabel: '',
        };
    };
    
    const [phone, setPhone] = useState(userData ? (userData as any).phone || '+234' : '+234 90 345 6789');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData());
    
    // Update form data when user data changes
    useEffect(() => {
        if (userData) {
            const newFormData = getInitialFormData();
            setFormData(newFormData);
            setPhone((userData as any).phone || '+234');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, userType]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toaster.create({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully',
                type: 'success',
                duration: 3000,
            });

            setIsEditing(false);
        } catch (error) {
            toaster.create({
                title: 'Update Failed',
                description: 'Failed to update profile. Please try again.',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <VStack align="stretch" gap={6}>
            <VStack align="start" gap={1}>
                <Text fontSize="md" fontWeight="semibold" color="gray.900">
                    Profile
                </Text>
                <Text fontSize="xs" color="gray.600">
                    Update your photo and personal details
                </Text>
            </VStack>

            {/* Profile Photo Section */}
            <HStack justify="space-between" align="start">
                <HStack gap={4}>
                    <Box
                        width={12}
                        height={12}
                        borderRadius="full"
                        bg="gray.200"
                        backgroundImage={userData 
                            ? (userType === 'artist' 
                                ? (userData as any).displayPicture 
                                    ? `url(${(userData as any).displayPicture})`
                                    : undefined
                                : userType === 'company'
                                ? (userData as any).labelLogo
                                    ? `url(${(userData as any).labelLogo})`
                                    : undefined
                                : (userData as any).companyLogo
                                    ? `url(${(userData as any).companyLogo})`
                                    : undefined)
                            : undefined}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="gray.600"
                        fontSize="sm"
                        fontWeight="bold"
                    >
                        {!userData || (!(userData as any).displayPicture && !(userData as any).labelLogo && !(userData as any).companyLogo)
                            ? (formData.fullName?.charAt(0).toUpperCase() || 'U')
                            : null}
                    </Box>
                    <VStack align="start" gap={0.5}>
                        <Text fontSize="xs" fontWeight="medium" color="gray.900">
                            Your photo
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                            This will be displayed on your profile.
                        </Text>
                    </VStack>
                </HStack>
                <Button
                    variant={isEditing ? "solid" : "outline"}
                    size="xs"
                    fontSize="xs"
                    fontWeight="medium"
                    borderColor={isEditing ? "transparent" : "gray.300"}
                    color={isEditing ? "white" : "gray.700"}
                    bg={isEditing ? "primary.500" : "transparent"}
                    _hover={{ bg: isEditing ? "primary.600" : "gray.50" }}
                    onClick={isEditing ? handleSave : handleEdit}
                    loading={isLoading}
                    loadingText="Saving..."
                    disabled={isLoading}
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
            </HStack>

            {/* Form Fields */}
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <VStack align="stretch" gap={3}>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Full Name
                        </Text>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Phone Number
                        </Text>
                        <PhoneInput
                            defaultCountry="ng"
                            value={phone}
                            showDisabledDialCodeAndPrefix={true}
                            disableDialCodeAndPrefix={true}
                            disableFormatting={false}
                            className='!text-[9px]'
                            onChange={(phone) => setPhone(phone)}
                            disabled={!isEditing || isLoading}
                            style={{
                                width: '100%',
                                opacity: (!isEditing || isLoading) ? 0.6 : 1,
                            }}
                            inputStyle={{
                                width: '100%',
                                height: '32px',
                                fontSize: '12px',
                                borderColor: 'transparent',
                                backgroundColor: '#f7fafc',
                                borderRadius: '6px',
                            }}
                            countrySelectorStyleProps={{
                                buttonStyle: {
                                    height: '32px',
                                    backgroundColor: '#f7fafc',
                                    borderColor: 'transparent',
                                    borderRadius: '6px',
                                },
                            }}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Location
                        </Text>
                        <Select
                            options={[{ value: 'lagos', label: 'Lagos' }]}
                            defaultValue={formData.location}
                            backgroundColor="gray.50"
                            borderColor="gray.200"
                            fontSize="xs"
                            size="sm"
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Record Label
                        </Text>
                        <Input
                            value={formData.recordLabel}
                            onChange={(e) => handleInputChange('recordLabel', e.target.value)}
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                </VStack>

                <VStack align="stretch" gap={3}>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Performing Name
                        </Text>
                        <Input
                            value={formData.performingName}
                            onChange={(e) => handleInputChange('performingName', e.target.value)}
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Email Address
                        </Text>
                        <Input
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Residential Address
                        </Text>
                        <Input
                            value={formData.residentialAddress}
                            onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                            placeholder="Residential Address"
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            User Type
                        </Text>
                        <Input
                            value={formData.userType}
                            onChange={(e) => handleInputChange('userType', e.target.value)}
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            disabled={!isEditing || isLoading}
                        />
                    </Box>
                </VStack>
            </Grid>
        </VStack>
    );
};
