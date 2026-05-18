import React from 'react';
import { Box, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { FiExternalLink, FiFileText, FiImage } from 'react-icons/fi';
import type { VerificationDocumentDto } from '../../types';

const isPdf = (url: string): boolean => /\.pdf(\?|$)/i.test(url);

const DocumentCard: React.FC<{ doc: VerificationDocumentDto }> = ({ doc }) => {
    const [failed, setFailed] = React.useState(false);
    const pdf = isPdf(doc.url);

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="12px" overflow="hidden">
            <HStack
                justify="space-between"
                px={3}
                py={2}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.100"
            >
                <HStack gap={2} minW={0}>
                    <Icon
                        as={pdf ? FiFileText : FiImage}
                        boxSize={3.5}
                        color="gray.500"
                    />
                    <VStack align="start" gap={0} minW={0}>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.800" lineClamp={1}>
                            {doc.label}
                        </Text>
                        {doc.ownerName && (
                            <Text fontSize="9px" color="gray.500" lineClamp={1}>
                                {doc.ownerName}
                            </Text>
                        )}
                    </VStack>
                </HStack>
                <HStack
                    as="a"
                    {...{ href: doc.url, target: '_blank', rel: 'noreferrer' }}
                    gap={1}
                    fontSize="10px"
                    color="primary.500"
                    fontWeight="medium"
                    flexShrink={0}
                    _hover={{ textDecoration: 'underline' }}
                >
                    <Text>Open</Text>
                    <Icon as={FiExternalLink} boxSize={3} />
                </HStack>
            </HStack>

            <Box bg="gray.100">
                {failed ? (
                    <VStack gap={1} py={8} px={4}>
                        <Text fontSize="11px" color="gray.500" textAlign="center">
                            Preview unavailable — the document link may have expired.
                        </Text>
                        <Text
                            as="a"
                            {...{ href: doc.url, target: '_blank', rel: 'noreferrer' }}
                            fontSize="11px"
                            color="primary.500"
                            fontWeight="medium"
                        >
                            Open in a new tab
                        </Text>
                    </VStack>
                ) : pdf ? (
                    <Box
                        as="iframe"
                        {...{ src: doc.url, title: doc.label }}
                        w="full"
                        h="320px"
                        border="none"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <Image
                        src={doc.url}
                        alt={doc.label}
                        w="full"
                        maxH="320px"
                        objectFit="contain"
                        onError={() => setFailed(true)}
                    />
                )}
            </Box>
        </Box>
    );
};

interface DocumentViewerProps {
    documents: VerificationDocumentDto[];
}

/**
 * Renders submitted verification documents — images inline, PDFs in an iframe,
 * each with an "open in new tab" escape hatch. Document URLs are short-lived
 * signed URLs, so a load failure shows a graceful fallback.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
    if (documents.length === 0) {
        return (
            <Box
                border="1px dashed"
                borderColor="gray.200"
                borderRadius="12px"
                py={8}
                px={4}
            >
                <Text fontSize="xs" color="gray.500" textAlign="center">
                    No documents were submitted with this request.
                </Text>
            </Box>
        );
    }

    return (
        <VStack align="stretch" gap={3}>
            {documents.map((doc, idx) => (
                <DocumentCard key={`${doc.kind}-${idx}`} doc={doc} />
            ))}
        </VStack>
    );
};
