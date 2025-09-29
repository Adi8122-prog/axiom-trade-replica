'use client';
import { useState, useEffect, useMemo, FC, SVGProps } from 'react';

// Type Definitions
type Token = {
  id: number,
  name: string,
  symbol: string,
  price: number,
  lastPrice?: number,
  change24h: number,
  liquidity: number,
  fdv: number,
  age: string,
  volume5m: number,
  chain: {
    name: string,
    icon: JSX.Element,
  },
};

type SortConfig = {
  key: keyof Token | null,
  direction: 'ascending' | 'descending',
};

// SVG Icon Components
const StarIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const InfoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const BaseIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="11" stroke="#0052FF" strokeWidth="2"/>
        <path d="M12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5Z" fill="#0052FF"/>
    </svg>
);

const EthereumIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}>
        <path fill="#343434" d="m127.961 0-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
        <path fill="#8C8C8C" d="m127.962 0-127.962 212.32 127.962 75.638V0z"/>
        <path fill="#3C3C3B" d="m127.961 312.186-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
        <path fill="#8C8C8C" d="M127.962 416.905V312.186L0 236.587z"/>
        <path fill="#141414" d="m127.961 287.958 127.962-75.637-127.962-58.162z"/>
        <path fill="#393939" d="m0 212.321 127.962 75.637v-133.8z"/>
    </svg>
);

// Mock Data Generation
const generateMockData = (count: number): Token[] => {
  const tokens: Token[] = [];
  const names = ['Token A', 'Token B', 'Token C', 'Token D', 'Token E', 'Token F', 'Token G', 'Token H', 'Token I', 'Token J', 'Token K', 'Token L'];
  const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(i => 'TKN' + i);

  for (let i = 1; i <= count; i++) {
    tokens.push({
      id: i,
      name: `${names[Math.floor(Math.random() * names.length)]}${names[Math.floor(Math.random() * names.length)].charAt(6)}`,
      symbol: `TKN${i}`,
      price: Math.random() * 10,
      change24h: (Math.random() - 0.5) * 20,
      liquidity: Math.random() * 500000,
      fdv: Math.random() * 25000000,
      age: `${Math.floor(Math.random() * 60)}m`,
      volume5m: Math.random() * 10000,
      chain: Math.random() > 0.5 
        ? { name: 'Base', icon: <BaseIcon className="w-5 h-5" /> }
        : { name: 'Ethereum', icon: <EthereumIcon className="w-4 h-4 mr-1" /> }
    });
  }
  return tokens;
};


// UI Components
const SkeletonLoader = () => (
    <div className="animate-pulse">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center space-x-3 w-1/12">
                    <div className="h-4 bg-gray-700 rounded w-4"></div>
                </div>
                <div className="w-3/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-2/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-1/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-1/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-1/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-1/12"><div className="h-4 bg-gray-700 rounded"></div></div>
                <div className="w-2/12"><div className="h-4 bg-gray-700 rounded"></div></div>
            </div>
        ))}
    </div>
);


const TokenTable = ({ tokens, loading, sortConfig, requestSort }: { tokens: Token[], loading: boolean, sortConfig: SortConfig, requestSort: (key: keyof Token) => void }) => {

    const getSortDirectionIcon = (key: keyof Token) => {
        if (sortConfig.key !== key) return '↕';
        if (sortConfig.direction === 'descending') return '↓';
        return '↑';
    };

    const headers: { key: keyof Token, label: string, sortable: boolean, className?: string }[] = [
        { key: 'name', label: 'Token', sortable: true, className: 'w-3/12' },
        { key: 'price', label: 'Price', sortable: true, className: 'w-2/12' },
        { key: 'change24h', label: '24h', sortable: true, className: 'w-1/12' },
        { key: 'liquidity', label: 'Liquidity', sortable: true, className: 'w-1/12' },
        { key: 'fdv', label: 'FDV', sortable: true, className: 'w-1/12' },
        { key: 'age', label: 'Age', sortable: true, className: 'w-1/12' },
        { key: 'volume5m', label: 'Volume (5m)', sortable: true, className: 'w-2/12' },
    ];

    if (loading) {
        return <SkeletonLoader />;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900 border-b border-gray-700">
                    <tr>
                        <th scope="col" className="p-3 w-1/12"></th>
                        {headers.map(({ key, label, sortable, className }) => (
                            <th key={key} scope="col" className={`p-3 ${className || ''} ${sortable ? 'cursor-pointer' : ''}`} onClick={() => sortable && requestSort(key)}>
                                {label} {sortable && <span className="text-gray-500">{getSortDirectionIcon(key)}</span>}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token, index) => (
                        <tr key={token.id} className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="p-3 text-center">
                                <span className="flex items-center space-x-2">
                                    <StarIcon className="w-4 h-4 text-gray-600 hover:text-yellow-400" />
                                    <span>{index + 1}</span>
                                </span>
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
                            <td className={`p-3 text-white`}>
                                <span className={
                                    `px-2 py-1 rounded-md transition-colors duration-500 ` +
                                    (token.lastPrice ? (token.price > token.lastPrice ? 'bg-green-800/50' : 'bg-red-800/50') : '')
                                }>
                                    ${token.price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                                </span>
                            </td>
                            <td className={`p-3 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change24h.toFixed(2)}%
                            </td>
                            <td className="p-3 text-white">${(token.liquidity / 1000).toFixed(2)}K</td>
                            <td className="p-3 text-white">${(token.fdv / 1000000).toFixed(2)}M</td>
                            <td className="p-3 text-white">{token.age}</td>
                            <td className="p-3 text-white">${(token.volume5m / 1000).toFixed(2)}K</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function Page() {
    const [activeTab, setActiveTab] = useState<'new' | 'stretch' | 'migrated'>('stretch');
    const [allTokens, setAllTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fdv', direction: 'descending' });
    
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setAllTokens(generateMockData(25));
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (allTokens.length === 0) return;

        const interval = setInterval(() => {
            setAllTokens(currentTokens => 
                currentTokens.map(token => {
                    const change = (Math.random() - 0.5) * 0.05 * token.price;
                    const newPrice = Math.max(0, token.price + change);
                    return { ...token, lastPrice: token.price, price: newPrice };
                })
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [allTokens.length]);


    const requestSort = (key: keyof Token) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTokens = useMemo(() => {
        if (!sortConfig.key) return allTokens;

        const sortableTokens = [...allTokens];
        sortableTokens.sort((a, b) => {
            if (a[sortConfig.key!] < b[sortConfig.key!]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key!] > b[sortConfig.key!]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableTokens;
    }, [allTokens, sortConfig]);

    const filteredTokens = useMemo(() => {
        // In a real app, you'd filter based on the active tab
        return sortedTokens;
    }, [sortedTokens, activeTab]);


    const TABS = [
        { id: 'new', label: 'New pairs', count: 15 },
        { id: 'stretch', label: 'Final Stretch', count: 10 },
        { id: 'migrated', label: 'Migrated', count: 5 },
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 md:p-8">
            <main className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">Token Discovery</h1>
                    <p className="text-gray-400 mt-2">Discover the next big token on Base and Ethereum.</p>
                </header>

                <div className="bg-[#101010] border border-gray-800 rounded-lg">
                    <div className="p-4 border-b border-gray-800">
                        <nav className="flex space-x-4">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-400 hover:bg-gray-800'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === tab.id ? 'bg-gray-500 text-white' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <TokenTable
                        tokens={filteredTokens}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                    />
                </div>
                
                <footer className="text-center text-gray-500 text-xs mt-8">
                    <p>Built by AI for a Frontend Task. Replicates Axiom.trade.</p>
                </footer>
            </main>
        </div>
    );
}

