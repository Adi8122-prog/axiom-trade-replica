'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
// Defines the structure for a single token's data
type TokenData = {
  id: number;
  name: string;
  symbol: string;
  chain: { name: string; icon: JSX.Element };
  price: number;
  priceChange24h: number;
  liquidity: number;
  fdv: number;
  age: string;
  buys: number;
  sells: number;
  volume5m: number;
  lastPrice?: number; // Used to track previous price for color flash effect
};

// Defines the configuration for sorting the table
type SortConfig = {
  key: keyof TokenData | null;
  direction: 'ascending' | 'descending';
};

// --- SVG ICONS (As Components for Reusability) ---
// Using inline SVGs to keep everything in one file and avoid external dependencies.

const EthereumIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-full">
    <circle cx="10" cy="10" r="10" fill="#627EEA"/>
    <path d="M10.213 4.25L10.07 4.54V11.23L10.213 11.373L13.88 9.1L10.213 4.25Z" fill="white" fillOpacity="0.6"/>
    <path d="M10.212 4.25L6.545 9.1L10.212 11.373V4.25Z" fill="white"/>
    <path d="M10.213 12.227L10.12 12.3V15.7L10.213 15.903L13.886 10.003L10.213 12.227Z" fill="white" fillOpacity="0.6"/>
    <path d="M10.212 15.903V12.226L6.545 10.003L10.212 15.903Z" fill="white"/>
    <path d="M10.213 11.373L13.88 9.1L10.213 6.873V11.373Z" fill="white" fillOpacity="0.2"/>
    <path d="M6.545 9.1L10.213 11.373V6.873L6.545 9.1Z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const BaseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#0052FF"/>
        <path d="M6 6H14V8H8V9H13V11H8V12H14V14H6V6Z" fill="white"/>
    </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-yellow-400 transition-colors cursor-pointer">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// --- MOCK DATA ---
// In a real application, this data would come from an API (fetched with React Query).
const generateMockData = (count: number, chain: 'Ethereum' | 'Base'): TokenData[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Token ${String.fromCharCode(65 + i)}${String.fromCharCode(97 + i)}`,
        symbol: `TKN${i + 1}`,
        chain: {
            name: chain,
            icon: chain === 'Ethereum' ? <EthereumIcon /> : <BaseIcon />,
        },
        price: parseFloat((Math.random() * 10).toFixed(6)),
        priceChange24h: (Math.random() - 0.5) * 20,
        liquidity: Math.floor(Math.random() * 500000) + 10000,
        fdv: Math.floor(Math.random() * 20000000) + 500000,
        age: `${Math.floor(Math.random() * 59) + 1}m`,
        buys: Math.floor(Math.random() * 500),
        sells: Math.floor(Math.random() * 500),
        volume5m: Math.floor(Math.random() * 10000),
    }));
};

const mockData = {
    'New pairs': generateMockData(15, 'Base'),
    'Final Stretch': generateMockData(10, 'Ethereum'),
    'Migrated': generateMockData(5, 'Base'),
};

type TabName = keyof typeof mockData;


// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => {
    if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
};

const formatPrice = (value: number) => {
    return `$${value.toFixed(6)}`;
}


// --- REUSABLE COMPONENTS (ATOMIC DESIGN APPROACH) ---
// In a real app, these would be in separate files (e.g., /components/ui/Tooltip.tsx)

// Simple Tooltip Component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {text}
        </div>
    </div>
);

// Skeleton Loader for Table Rows
const SkeletonRow = () => (
    <tr className="border-b border-gray-800 animate-pulse">
        <td className="p-3 text-sm text-gray-400"><div className="h-5 bg-gray-700 rounded w-8"></div></td>
        <td className="p-3 text-sm font-medium text-white">
            <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
                <div className="h-5 bg-gray-700 rounded w-24"></div>
            </div>
        </td>
        <td className="p-3 text-sm text-white"><div className="h-5 bg-gray-700 rounded w-20"></div></td>
        <td className="p-3 text-sm"><div className="h-5 bg-gray-700 rounded w-16"></div></td>
        <td className="p-3 text-sm text-gray-300 hidden md:table-cell"><div className="h-5 bg-gray-700 rounded w-20"></div></td>
        <td className="p-3 text-sm text-gray-300 hidden lg:table-cell"><div className="h-5 bg-gray-700 rounded w-20"></div></td>
        <td className="p-3 text-sm text-gray-300 hidden xl:table-cell"><div className="h-5 bg-gray-700 rounded w-12"></div></td>
        <td className="p-3 text-sm text-gray-300 hidden xl:table-cell"><div className="h-5 bg-gray-700 rounded w-24"></div></td>
    </tr>
);


// --- CORE TABLE COMPONENT ---
// This component is responsible for rendering the table headers and rows.
const TokenTable = ({ 
    data,
    requestSort,
    sortConfig,
}: { 
    data: TokenData[];
    requestSort: (key: keyof TokenData) => void;
    sortConfig: SortConfig;
}) => {
    const getSortIndicator = (key: keyof TokenData) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const headers: { key: keyof TokenData; label: string; tooltip: string, className?: string }[] = [
        { key: 'name', label: 'Token', tooltip: 'Token name and symbol' },
        { key: 'price', label: 'Price', tooltip: 'Current token price' },
        { key: 'priceChange24h', label: '24h', tooltip: 'Price change in the last 24 hours' },
        { key: 'liquidity', label: 'Liquidity', tooltip: 'Total liquidity available', className: 'hidden md:table-cell' },
        { key: 'fdv', label: 'FDV', tooltip: 'Fully Diluted Valuation', className: 'hidden lg:table-cell' },
        { key: 'age', label: 'Age', tooltip: 'Time since pair was created', className: 'hidden xl:table-cell' },
        { key: 'volume5m', label: 'Volume (5m)', tooltip: 'Trading volume in the last 5 minutes', className: 'hidden xl:table-cell' },
    ];
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
                <thead className="border-b border-gray-800">
                    <tr>
                        <th className="p-3 text-xs font-medium text-gray-400 w-12"></th>
                        {headers.map(header => (
                            <th
                                key={header.key}
                                className={`p-3 text-xs font-medium text-gray-400 cursor-pointer hover:text-white transition-colors ${header.className || ''}`}
                                onClick={() => requestSort(header.key)}
                            >
                                <div className="flex items-center space-x-2">
                                    <Tooltip text={header.tooltip}>
                                        <div className="flex items-center space-x-1">
                                            <span>{header.label}</span>
                                            <InfoIcon />
                                        </div>
                                    </Tooltip>
                                    <span className="text-gray-500 text-[10px]">{getSortIndicator(header.key)}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((token, index) => (
                        <tr key={token.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <td className="p-3 text-sm text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <span>{index + 1}</span>
                                    <StarIcon />
                                </div>
                            </td>
                            <td className="p-3 text-sm font-medium text-white">
                                <div className="flex items-center space-x-3">
                                    {token.chain.icon}
                                    <div className="flex flex-col">
                                        <span>{token.name}</span>
                                        <span className="text-xs text-gray-400">{token.symbol}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-3 text-sm text-white">
                                 <span className={
                                     token.price > (token.lastPrice ?? token.price) ? 'text-green-400 bg-green-500/10 px-2 py-1 rounded-md transition-all duration-500' :
                                     token.price < (token.lastPrice ?? token.price) ? 'text-red-400 bg-red-500/10 px-2 py-1 rounded-md transition-all duration-500' :
                                     'transition-all duration-500 px-2 py-1'
                                 }>
                                    {formatPrice(token.price)}
                                </span>
                            </td>
                            <td className={`p-3 text-sm ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.priceChange24h.toFixed(2)}%
                            </td>
                            <td className="p-3 text-sm text-gray-300 hidden md:table-cell">{formatCurrency(token.liquidity)}</td>
                            <td className="p-3 text-sm text-gray-300 hidden lg:table-cell">{formatCurrency(token.fdv)}</td>
                            <td className="p-3 text-sm text-gray-300 hidden xl:table-cell">{token.age}</td>
                            <td className="p-3 text-sm text-gray-300 hidden xl:table-cell">{formatCurrency(token.volume5m)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
// This is the root component that ties everything together for the page.
export default function Page() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabName>('New pairs');
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fdv', direction: 'descending' });

    // Simulate initial data fetching
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setTokens(mockData[activeTab]);
            setIsLoading(false);
        }, 1500); // Simulate network delay
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Simulate real-time price updates (like a WebSocket connection)
    useEffect(() => {
        if (isLoading) return;

        const interval = setInterval(() => {
            setTokens(currentTokens => {
                return currentTokens.map(token => {
                    // Randomly update a few tokens to simulate real-time activity
                    if (Math.random() < 0.2) { 
                        const change = (Math.random() - 0.5) * 0.05 * token.price;
                        return {
                            ...token,
                            lastPrice: token.price,
                            price: Math.max(0, token.price + change), // Ensure price doesn't go negative
                        };
                    }
                    return { ...token, lastPrice: token.price };
                });
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [isLoading]);

    // Memoized sorting logic to prevent re-computation on every render
    const sortedTokens = useMemo(() => {
        let sortableTokens = [...tokens];
        if (sortConfig.key) {
            sortableTokens.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableTokens;
    }, [tokens, sortConfig]);

    // Callback to handle sort requests from the table header
    const requestSort = useCallback((key: keyof TokenData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);
    
    const tabs: TabName[] = ['New pairs', 'Final Stretch', 'Migrated'];

    return (
        <div className="bg-[#0D0D0D] text-white min-h-screen font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold">Token Discovery</h1>
                    <p className="text-gray-400 mt-2">Discover the next big token on Base and Ethereum.</p>
                </header>

                {/* Main Content Area */}
                <main className="bg-[#121212] border border-gray-800 rounded-lg shadow-lg">
                    {/* Tabs Navigation */}
                    <div className="p-2 sm:p-4 border-b border-gray-800">
                        <div className="bg-black p-1 rounded-lg flex flex-wrap space-x-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 flex-grow sm:flex-grow-0
                                        ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`
                                    }
                                >
                                    {tab} ({mockData[tab].length})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Section */}
                    {isLoading ? (
                        <table className="w-full text-left">
                           {/* A simplified header for skeleton to avoid layout shifts */}
                           <thead className="border-b border-gray-800 invisible">
                               <tr>
                                  <th className="p-3 w-12"></th>
                                  <th className="p-3">Token</th>
                                  <th className="p-3">Price</th>
                                  <th className="p-3">24h</th>
                                  <th className="p-3 hidden md:table-cell">Liquidity</th>
                                  <th className="p-3 hidden lg:table-cell">FDV</th>
                                  <th className="p-3 hidden xl:table-cell">Age</th>
                                  <th className="p-3 hidden xl:table-cell">Volume (5m)</th>
                               </tr>
                           </thead>
                           <tbody>
                                {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
                           </tbody>
                        </table>
                    ) : (
                        <TokenTable data={sortedTokens} requestSort={requestSort} sortConfig={sortConfig} />
                    )}
                </main>
            </div>
        </div>
    );
};

