import React, { useState, useEffect } from 'react';
import '../styles/Investments.css';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiPieChart,
    FiBarChart2,
    FiActivity,
    FiPlus,
    FiArrowUpRight,
    FiArrowDownRight,
    FiCalendar,
    FiClock,
    FiTarget,
    FiAward,
    FiShield,
    FiRefreshCw,
    FiDownload,
    FiFilter,
    FiSearch,
    FiChevronRight,
    FiInfo
} from 'react-icons/fi';

const Investments = ({ onBack, darkMode }) => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [investments, setInvestments] = useState([]);
    const [portfolioStats, setPortfolioStats] = useState({
        totalValue: 0,
        totalInvested: 0,
        totalReturns: 0,
        returnPercentage: 0
    });

    const sampleInvestments = [
        {
            id: 1,
            name: 'Mutual Fund - Large Cap',
            type: 'Mutual Fund',
            category: 'Equity',
            invested: 50000,
            currentValue: 58500,
            returns: 8500,
            returnPercentage: 17.0,
            units: 125.5,
            nav: 466.13,
            startDate: '2023-06-15',
            risk: 'Medium',
            status: 'active',
            color: '#3b82f6'
        },
        {
            id: 2,
            name: 'Fixed Deposit',
            type: 'Fixed Deposit',
            category: 'Debt',
            invested: 100000,
            currentValue: 107500,
            returns: 7500,
            returnPercentage: 7.5,
            interestRate: 7.5,
            maturityDate: '2025-12-31',
            startDate: '2023-01-01',
            risk: 'Low',
            status: 'active',
            color: '#10b981'
        },
        {
            id: 3,
            name: 'Stocks - Tech Portfolio',
            type: 'Stocks',
            category: 'Equity',
            invested: 75000,
            currentValue: 92000,
            returns: 17000,
            returnPercentage: 22.67,
            shares: 150,
            avgPrice: 500,
            currentPrice: 613.33,
            startDate: '2023-03-20',
            risk: 'High',
            status: 'active',
            color: '#8b5cf6'
        },
        {
            id: 4,
            name: 'Gold ETF',
            type: 'ETF',
            category: 'Commodity',
            invested: 30000,
            currentValue: 33600,
            returns: 3600,
            returnPercentage: 12.0,
            units: 60,
            nav: 560,
            startDate: '2023-08-10',
            risk: 'Medium',
            status: 'active',
            color: '#f59e0b'
        },
        {
            id: 5,
            name: 'Mutual Fund - Debt',
            type: 'Mutual Fund',
            category: 'Debt',
            invested: 40000,
            currentValue: 42800,
            returns: 2800,
            returnPercentage: 7.0,
            units: 200,
            nav: 214,
            startDate: '2023-05-01',
            risk: 'Low',
            status: 'active',
            color: '#06d6a0'
        },
        {
            id: 6,
            name: 'PPF Account',
            type: 'PPF',
            category: 'Government',
            invested: 150000,
            currentValue: 162000,
            returns: 12000,
            returnPercentage: 8.0,
            interestRate: 7.1,
            maturityDate: '2038-03-31',
            startDate: '2023-04-01',
            risk: 'Very Low',
            status: 'active',
            color: '#ef4444'
        }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('epic_logged_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData(user);

            const storedInvestments = localStorage.getItem('user_investments');
            const loadedInvestments = storedInvestments ? JSON.parse(storedInvestments) : sampleInvestments;

            setInvestments(loadedInvestments);

            const totalInvested = loadedInvestments.reduce((sum, inv) => sum + inv.invested, 0);
            const totalValue = loadedInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
            const totalReturns = totalValue - totalInvested;
            const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

            setPortfolioStats({
                totalValue,
                totalInvested,
                totalReturns,
                returnPercentage
            });

            if (!storedInvestments) {
                localStorage.setItem('user_investments', JSON.stringify(sampleInvestments));
            }
        }
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getRiskColor = (risk) => {
        switch (risk.toLowerCase()) {
            case 'very low': return '#10b981';
            case 'low': return '#06d6a0';
            case 'medium': return '#f59e0b';
            case 'high': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'equity': return <FiTrendingUp />;
            case 'debt': return <FiShield />;
            case 'commodity': return <FiAward />;
            case 'government': return <FiTarget />;
            default: return <FiPieChart />;
        }
    };

    const tabs = [
        { id: 'portfolio', label: 'Portfolio', icon: <FiPieChart /> },
        { id: 'explore', label: 'Explore', icon: <FiSearch /> },
        { id: 'performance', label: 'Performance', icon: <FiBarChart2 /> },
        { id: 'goals', label: 'Goals', icon: <FiTarget /> }
    ];

    const renderPortfolio = () => (
        <div className="portfolio-section">
            <div className="section-header">
                <h3>My Investments</h3>
                <button className="add-button">
                    <FiPlus /> Add Investment
                </button>
            </div>

            <div className="investments-grid">
                {investments.map(investment => (
                    <div key={investment.id} className="investment-card">
                        <div className="investment-header">
                            <div className="investment-icon" style={{ background: investment.color + '20', color: investment.color }}>
                                {getCategoryIcon(investment.category)}
                            </div>
                            <div className="investment-info">
                                <h4>{investment.name}</h4>
                                <p>{investment.type} • {investment.category}</p>
                            </div>
                            <span className="risk-badge" style={{ background: getRiskColor(investment.risk) + '20', color: getRiskColor(investment.risk) }}>
                                {investment.risk}
                            </span>
                        </div>

                        <div className="investment-values">
                            <div className="value-row">
                                <span className="value-label">Current Value</span>
                                <span className="value-amount current">{formatCurrency(investment.currentValue)}</span>
                            </div>
                            <div className="value-row">
                                <span className="value-label">Invested</span>
                                <span className="value-amount">{formatCurrency(investment.invested)}</span>
                            </div>
                            <div className="value-row returns">
                                <span className="value-label">Returns</span>
                                <div className="returns-info">
                                    <span className={`returns-amount ${investment.returns >= 0 ? 'positive' : 'negative'}`}>
                                        {investment.returns >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                        {formatCurrency(Math.abs(investment.returns))}
                                    </span>
                                    <span className={`returns-percentage ${investment.returns >= 0 ? 'positive' : 'negative'}`}>
                                        {investment.returnPercentage >= 0 ? '+' : ''}{investment.returnPercentage.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="investment-details">
                            {investment.units && (
                                <div className="detail-item">
                                    <span className="detail-label">Units</span>
                                    <span className="detail-value">{investment.units}</span>
                                </div>
                            )}
                            {investment.nav && (
                                <div className="detail-item">
                                    <span className="detail-label">NAV</span>
                                    <span className="detail-value">₹{investment.nav}</span>
                                </div>
                            )}
                            {investment.shares && (
                                <div className="detail-item">
                                    <span className="detail-label">Shares</span>
                                    <span className="detail-value">{investment.shares}</span>
                                </div>
                            )}
                            {investment.currentPrice && (
                                <div className="detail-item">
                                    <span className="detail-label">Current Price</span>
                                    <span className="detail-value">₹{investment.currentPrice.toFixed(2)}</span>
                                </div>
                            )}
                            {investment.interestRate && (
                                <div className="detail-item">
                                    <span className="detail-label">Interest Rate</span>
                                    <span className="detail-value">{investment.interestRate}%</span>
                                </div>
                            )}
                            {investment.maturityDate && (
                                <div className="detail-item">
                                    <span className="detail-label">Maturity</span>
                                    <span className="detail-value">{investment.maturityDate}</span>
                                </div>
                            )}
                        </div>

                        <div className="investment-footer">
                            <span className="start-date">
                                <FiCalendar /> Since {investment.startDate}
                            </span>
                            <button className="view-details-btn">
                                View Details <FiChevronRight />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="portfolio-allocation">
                <h4>Portfolio Allocation</h4>
                <div className="allocation-chart">
                    {['Equity', 'Debt', 'Commodity', 'Government'].map((category, index) => {
                        const categoryInvestments = investments.filter(inv => inv.category === category);
                        const categoryValue = categoryInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                        const percentage = portfolioStats.totalValue > 0 ? (categoryValue / portfolioStats.totalValue) * 100 : 0;

                        if (percentage === 0) return null;

                        return (
                            <div key={category} className="allocation-item">
                                <div className="allocation-info">
                                    <span className="allocation-icon">{getCategoryIcon(category)}</span>
                                    <span className="allocation-name">{category}</span>
                                </div>
                                <div className="allocation-bar">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]
                                        }}
                                    ></div>
                                </div>
                                <span className="allocation-percent">{percentage.toFixed(1)}%</span>
                                <span className="allocation-value">{formatCurrency(categoryValue)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderExplore = () => (
        <div className="explore-section">
            <div className="section-header">
                <h3>Explore Investment Options</h3>
                <div className="header-actions">
                    <div className="search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search investments..." />
                    </div>
                    <button className="filter-btn">
                        <FiFilter /> Filter
                    </button>
                </div>
            </div>

            <div className="investment-categories">
                <div className="category-card">
                    <div className="category-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <FiTrendingUp />
                    </div>
                    <h4>Mutual Funds</h4>
                    <p>Professionally managed investment funds</p>
                    <div className="category-stats">
                        <span>Returns: 12-18%</span>
                        <span>Risk: Medium</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>

                <div className="category-card">
                    <div className="category-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <FiActivity />
                    </div>
                    <h4>Stocks</h4>
                    <p>Direct equity investments in companies</p>
                    <div className="category-stats">
                        <span>Returns: 15-25%</span>
                        <span>Risk: High</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>

                <div className="category-card">
                    <div className="category-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <FiShield />
                    </div>
                    <h4>Fixed Deposits</h4>
                    <p>Safe and guaranteed returns</p>
                    <div className="category-stats">
                        <span>Returns: 6-8%</span>
                        <span>Risk: Low</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>

                <div className="category-card">
                    <div className="category-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <FiAward />
                    </div>
                    <h4>Gold</h4>
                    <p>Invest in digital gold and ETFs</p>
                    <div className="category-stats">
                        <span>Returns: 8-12%</span>
                        <span>Risk: Medium</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>

                <div className="category-card">
                    <div className="category-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                        <FiTarget />
                    </div>
                    <h4>Government Schemes</h4>
                    <p>PPF, NSC, and other government schemes</p>
                    <div className="category-stats">
                        <span>Returns: 7-8%</span>
                        <span>Risk: Very Low</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>

                <div className="category-card">
                    <div className="category-icon" style={{ background: '#06d6a020', color: '#06d6a0' }}>
                        <FiPieChart />
                    </div>
                    <h4>ETFs</h4>
                    <p>Exchange-traded funds for diversification</p>
                    <div className="category-stats">
                        <span>Returns: 10-15%</span>
                        <span>Risk: Medium</span>
                    </div>
                    <button className="explore-btn">Explore <FiChevronRight /></button>
                </div>
            </div>
        </div>
    );

    const renderPerformance = () => (
        <div className="performance-section">
            <div className="section-header">
                <h3>Performance Analysis</h3>
                <div className="header-actions">
                    <select className="period-select">
                        <option>1 Month</option>
                        <option>3 Months</option>
                        <option>6 Months</option>
                        <option>1 Year</option>
                        <option>3 Years</option>
                        <option>All Time</option>
                    </select>
                    <button className="primary-btn"><FiDownload /> Report</button>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="performance-kpi-grid">
                <div className="kpi-card highlight">
                    <div className="kpi-icon"><FiTrendingUp /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">XIRR</span>
                        <h4 className="kpi-value">18.4%</h4>
                        <span className="kpi-sub provided">Annualized Return</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><FiActivity /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">CAGR</span>
                        <h4 className="kpi-value">15.2%</h4>
                        <span className="kpi-sub">Compounded Annual Growth</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><FiDollarSign /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Realized P&L</span>
                        <h4 className="kpi-value">₹12,450</h4>
                        <span className="kpi-sub">Booked Profit</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><FiPieChart /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">Unrealized P&L</span>
                        <h4 className="kpi-value positive">+{formatCurrency(portfolioStats.totalReturns)}</h4>
                        <span className="kpi-sub">Current Holdings</span>
                    </div>
                </div>
            </div>

            {/* Growth Chart & Comparison */}
            <div className="chart-container-premium">
                <div className="chart-header">
                    <h4>Portfolio Growth vs Benchmark (Nifty 50)</h4>
                    <div className="chart-legend">
                        <span className="legend-item portfolio"><span className="dot"></span> You</span>
                        <span className="legend-item benchmark"><span className="dot"></span> Nifty 50</span>
                    </div>
                </div>

                {/* CSS Based Interactive-looking Chart */}
                <div className="simulated-chart">
                    {[40, 45, 42, 50, 55, 53, 60, 65, 70, 68, 75, 80].map((val, i) => (
                        <div key={i} className="chart-column">
                            <div className="chart-bar portfolio-bar" style={{ height: `${val}%` }}>
                                <div className="tooltip">₹{(val * 1000).toLocaleString()}</div>
                            </div>
                            <div className="chart-bar benchmark-bar" style={{ height: `${val * 0.8}%` }}></div>
                            <span className="x-label">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="top-movers-section">
                <h4>Top Movers</h4>
                <div className="movers-grid">
                    <div className="mover-card positive">
                        <div className="mover-header">
                            <span className="mover-name">Tata Motors</span>
                            <span className="mover-percent">+4.2%</span>
                        </div>
                        <p className="mover-price">₹980.50</p>
                    </div>
                    <div className="mover-card positive">
                        <div className="mover-header">
                            <span className="mover-name">HDFC Bank</span>
                            <span className="mover-percent">+1.8%</span>
                        </div>
                        <p className="mover-price">₹1,650.00</p>
                    </div>
                    <div className="mover-card negative">
                        <div className="mover-header">
                            <span className="mover-name">Infosys</span>
                            <span className="mover-percent">-2.1%</span>
                        </div>
                        <p className="mover-price">₹1,420.00</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGoals = () => (
        <div className="goals-section">
            <div className="section-header">
                <h3>Investment Goals</h3>
                <button className="add-button">
                    <FiPlus /> Add Goal
                </button>
            </div>

            <div className="goals-grid">
                <div className="goal-card">
                    <div className="goal-header">
                        <div className="goal-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                            <FiTarget />
                        </div>
                        <h4>Retirement Fund</h4>
                    </div>
                    <div className="goal-progress">
                        <div className="progress-info">
                            <span>₹12,50,000 of ₹50,00,000</span>
                            <span>25%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '25%', background: '#3b82f6' }}></div>
                        </div>
                    </div>
                    <div className="goal-details">
                        <span><FiCalendar /> Target: 2045</span>
                        <span><FiClock /> 21 years left</span>
                    </div>
                </div>

                <div className="goal-card">
                    <div className="goal-header">
                        <div className="goal-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                            <FiTarget />
                        </div>
                        <h4>Child Education</h4>
                    </div>
                    <div className="goal-progress">
                        <div className="progress-info">
                            <span>₹8,00,000 of ₹20,00,000</span>
                            <span>40%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '40%', background: '#10b981' }}></div>
                        </div>
                    </div>
                    <div className="goal-details">
                        <span><FiCalendar /> Target: 2035</span>
                        <span><FiClock /> 11 years left</span>
                    </div>
                </div>

                <div className="goal-card">
                    <div className="goal-header">
                        <div className="goal-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                            <FiTarget />
                        </div>
                        <h4>Dream Home</h4>
                    </div>
                    <div className="goal-progress">
                        <div className="progress-info">
                            <span>₹15,00,000 of ₹1,00,00,000</span>
                            <span>15%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '15%', background: '#f59e0b' }}></div>
                        </div>
                    </div>
                    <div className="goal-details">
                        <span><FiCalendar /> Target: 2030</span>
                        <span><FiClock /> 6 years left</span>
                    </div>
                </div>
            </div>

            <div className="goal-tips">
                <div className="tip-card">
                    <FiInfo />
                    <div className="tip-content">
                        <h5>Investment Tip</h5>
                        <p>Increase your monthly SIP by ₹5,000 to reach your retirement goal 3 years earlier</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!userData) {
        return <div className="loading-container">Loading Investments...</div>;
    }

    return (
        <div className={`investments-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="investments-layout">
                {/* Static Sidebar */}
                <div className="sidebar-container">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Investments</h2>
                        <p className="sidebar-subtitle">Manage Portfolio</p>
                    </div>

                    <nav className="sidebar-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="nav-icon">{tab.icon}</span>
                                <span className="nav-label">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Quick Actions / Tips in Sidebar */}
                    <div className="sidebar-quick-actions">
                        <div className="quick-actions-header">Quick Actions</div>
                        <button className="sidebar-action-btn">
                            <FiPlus /> New Investment
                        </button>
                        <button className="sidebar-action-btn">
                            <FiDownload /> Reports
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="investments-main-content">
                    {/* Header in Main Content */}
                    <div className="content-header">
                        <div>
                            <h1 className="page-title">
                                {tabs.find(t => t.id === activeTab)?.label || 'Investments'}
                            </h1>
                            <p className="page-subtitle">Track and manage your {activeTab}</p>
                        </div>
                        <button className="back-button" onClick={onBack}>
                            ← Back
                        </button>
                    </div>

                    {/* render content based on tab */}
                    {activeTab === 'portfolio' && (
                        <>
                            {/* Portfolio Overview Cards - Keep them here for Portfolio Tab */}
                            <div className="portfolio-overview">
                                <div className="overview-card">
                                    <div className="overview-icon value-icon">
                                        <FiPieChart />
                                    </div>
                                    <div className="overview-content">
                                        <h4>Total Portfolio</h4>
                                        <p className="overview-value">{formatCurrency(portfolioStats.totalValue)}</p>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className="overview-icon invested-icon">
                                        <FiDollarSign />
                                    </div>
                                    <div className="overview-content">
                                        <h4>Total Invested</h4>
                                        <p className="overview-value">{formatCurrency(portfolioStats.totalInvested)}</p>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className={`overview-icon ${portfolioStats.totalReturns >= 0 ? 'positive-icon' : 'negative-icon'}`}>
                                        {portfolioStats.totalReturns >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                    </div>
                                    <div className="overview-content">
                                        <h4>Total Returns</h4>
                                        <p className={`overview-value ${portfolioStats.totalReturns >= 0 ? 'positive' : 'negative'}`}>
                                            {formatCurrency(Math.abs(portfolioStats.totalReturns))}
                                        </p>
                                        <span className={`overview-change ${portfolioStats.totalReturns >= 0 ? 'positive' : 'negative'}`}>
                                            {portfolioStats.returnPercentage >= 0 ? '+' : ''}{portfolioStats.returnPercentage.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overview-card">
                                    <div className="overview-icon active-icon">
                                        <FiBarChart2 />
                                    </div>
                                    <div className="overview-content">
                                        <h4>Active Assets</h4>
                                        <p className="overview-value">{investments.length}</p>
                                    </div>
                                </div>
                            </div>
                            {renderPortfolio()}
                        </>
                    )}

                    {activeTab === 'explore' && renderExplore()}
                    {activeTab === 'performance' && renderPerformance()}
                    {activeTab === 'goals' && renderGoals()}
                </div>
            </div>
        </div>
    );
};

export default Investments;
