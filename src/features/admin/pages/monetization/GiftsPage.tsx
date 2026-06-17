import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { AdminPageLayout } from '../../components/ui';
import GiftCatalog from './gifts/GiftCatalog';
import GiftTransactions from './gifts/GiftTransactions';

type TabKey = 'transactions' | 'catalog';

const ACCENT = '#f94444';

const TABS: [TabKey, string][] = [
    ['transactions', 'Transactions'],
    ['catalog', 'Catalog'],
];

/**
 * Gifts management console — the single home for gifting on the platform.
 * "Transactions" is the live gift ledger (KPIs, filters, reversal, export);
 * "Catalog" manages the gift types fans can send (create/edit/activate, images).
 */
const GiftsPage: React.FC = () => {
    const [tab, setTab] = React.useState<TabKey>('transactions');

    return (
        <AdminPageLayout
            title="Gifts"
            subtitle="Coin gifts across the platform — manage the gift catalog and review the gift ledger."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Gifts' }]}
            toolbar={
                <HStack gap={2} flexWrap="wrap">
                    {TABS.map(([key, label]) => (
                        <Button
                            key={key}
                            size="sm"
                            fontSize="xs"
                            borderRadius="999px"
                            onClick={() => setTab(key)}
                            bg={tab === key ? ACCENT : 'white'}
                            color={tab === key ? 'white' : 'gray.700'}
                            border="1px solid"
                            borderColor={tab === key ? ACCENT : 'gray.200'}
                            _hover={{ bg: tab === key ? '#e53939' : 'gray.50' }}
                        >
                            {label}
                        </Button>
                    ))}
                </HStack>
            }
        >
            {tab === 'transactions' ? <GiftTransactions /> : <GiftCatalog />}
        </AdminPageLayout>
    );
};

export default GiftsPage;
