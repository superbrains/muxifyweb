import React, { useState } from 'react';
import { Box, Text, VStack, HStack, Input, Button, Icon, Flex } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdsStore } from '../../store/useAdsStore';
import { AdCard } from './AdCard';
import { ConfirmModal } from '@shared/components';

export const PhotoAdsTab: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { getCampaignsByType, deleteCampaign } = useAdsStore();
    const navigate = useNavigate();

    const photoCampaigns = getCampaignsByType('photo');

    // Filter campaigns based on search query
    const filteredCampaigns = photoCampaigns.filter((campaign) =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (campaignId: string) => {
        navigate(`/ads/create-campaign?tab=photo&id=${campaignId}`);
    };

    const handleDelete = (campaignId: string) => {
        setDeleteCampaignId(campaignId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteCampaignId) {
            deleteCampaign(deleteCampaignId);
            setDeleteCampaignId(null);
        }
    };

    const handleView = (campaignId: string) => {
        navigate(`/ads/view/${campaignId}`);
    };

    const handleNewCampaign = () => {
        navigate('/ads/create-campaign?tab=photo');
    };

    const handleFilters = () => {
        // TODO: Implement filters modal
        console.log('Open filters');
    };

    if (photoCampaigns.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" p={8} textAlign="center">
                <VStack gap={4}>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                        No Photo Ads Yet
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Create your first photo ad campaign to get started
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <VStack align="stretch" gap={4} bg="white" borderBottomRadius="lg" p={4}>
            {/* Search, Filters, and New Campaign Bar */}
            <Flex justify="flex-end" align="center" gap={0}>
                {/* Search Input */}
                <HStack
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={3}
                    h="40px"
                    w="250px"
                    gap={2}
                >
                    <Icon as={FiSearch} color="gray.400" boxSize={4} />
                    <Input
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        border="none"
                        p={0}
                        h="auto"
                        fontSize="12px"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ boxShadow: 'none' }}
                    />
                </HStack>

                {/* Separator */}
                <Box w="1px" h="40px" bg="gray.200" mx={2} />

                {/* Filters Button */}
                <Button
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.600"
                    fontSize="12px"
                    h="40px"
                    px={4}
                    borderRadius="md"
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    onClick={handleFilters}
                >
                    <Icon as={FiFilter} boxSize={4} mr={2} />
                    Filters
                </Button>

                {/* Separator */}
                <Box w="1px" h="40px" bg="gray.200" mx={2} />

                {/* New Campaign Button */}
                <Button
                    bg="primary.500"
                    color="white"
                    fontSize="12px"
                    h="40px"
                    px={4}
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={handleNewCampaign}
                >
                    <Icon as={FiPlus} boxSize={4} mr={2} />
                    New Campaign
                </Button>
            </Flex>

            {/* Campaign Cards */}
            {filteredCampaigns.length === 0 ? (
                <Box bg="white" borderRadius="lg" p={8} textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                        No campaigns found matching "{searchQuery}"
                    </Text>
                </Box>
            ) : (
                filteredCampaigns.map((campaign) => (
                    <AdCard
                        key={campaign.id}
                        campaign={campaign}
                        onEdit={() => handleEdit(campaign.id)}
                        onDelete={() => handleDelete(campaign.id)}
                        onView={() => handleView(campaign.id)}
                    />
                ))
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteCampaignId(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Campaign"
                message="Are you sure you want to delete this campaign? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="red"
            />
        </VStack>
    );
};

