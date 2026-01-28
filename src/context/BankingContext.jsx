import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State
const initialState = {
    accounts: [],
    transactions: [],
    auditLogs: [],
    user: null,
    activeAccount: null, // Track currently unlocked account
    lastUpdated: null
};

// Action Types
export const ACTIONS = {
    // Account Actions
    CREATE_ACCOUNT: 'CREATE_ACCOUNT',
    DELETE_ACCOUNT: 'DELETE_ACCOUNT',
    UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
    SET_ACTIVE_ACCOUNT: 'SET_ACTIVE_ACCOUNT',
    UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
    UPDATE_ACCOUNT_MPIN: 'UPDATE_ACCOUNT_MPIN',
    TOGGLE_ACCOUNT_STATUS: 'TOGGLE_ACCOUNT_STATUS',

    // Transaction Actions
    DEPOSIT: 'DEPOSIT',
    WITHDRAW: 'WITHDRAW',
    TRANSFER: 'TRANSFER',

    // System Actions
    LOAD_DATA: 'LOAD_DATA',
    SET_USER: 'SET_USER',
    ADD_AUDIT_LOG: 'ADD_AUDIT_LOG',
    CLEAR_DATA: 'CLEAR_DATA'
};

// Helper: Save state to localStorage (Global Sync)
const syncToStorage = (updatedState) => {
    try {
        if (!updatedState.user) return; // Don't save if no user

        // 1. Update logged in user
        localStorage.setItem('epic_logged_user', JSON.stringify(updatedState));

        // 2. Update this user in all_users list
        const allUsersJSON = localStorage.getItem('epic_all_users');
        if (allUsersJSON) {
            const allUsers = JSON.parse(allUsersJSON);
            const userIndex = allUsers.findIndex(u =>
                u.user && u.user.crn === updatedState.user.crn
            );

            if (userIndex !== -1) {
                allUsers[userIndex] = updatedState;
                localStorage.setItem('epic_all_users', JSON.stringify(allUsers));
            }
        }
    } catch (error) {
        console.error("Failed to sync to storage:", error);
    }
};

// Accounts Reducer
function accountsReducer(state, action) {
    switch (action.type) {
        case ACTIONS.CREATE_ACCOUNT: {
            const { accountData } = action.payload;

            // Check for duplicate account
            const duplicate = state.find(acc =>
                acc.accountNumber === accountData.accountNumber
            );

            if (duplicate) {
                throw new Error('Account with this number already exists');
            }

            const newAccount = {
                id: `ACC${Date.now()}`,
                accountNumber: accountData.accountNumber,
                accountType: accountData.accountType || 'Savings',
                bankName: accountData.bankName || 'Epic Bank',
                balance: parseFloat(accountData.initialBalance) || 0,
                currency: 'INR',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            return [...state, newAccount];
        }

        case ACTIONS.DELETE_ACCOUNT: {
            const { accountId } = action.payload;
            return state.filter(acc => acc.id !== accountId);
        }

        case ACTIONS.DEPOSIT: {
            const { accountId, amount } = action.payload;
            return state.map(acc =>
                acc.id === accountId
                    ? {
                        ...acc,
                        balance: acc.balance + amount,
                        lastUpdated: new Date().toISOString()
                    }
                    : acc
            );
        }

        case ACTIONS.WITHDRAW: {
            const { accountId, amount } = action.payload;
            return state.map(acc =>
                acc.id === accountId
                    ? {
                        ...acc,
                        balance: acc.balance - amount,
                        lastUpdated: new Date().toISOString()
                    }
                    : acc
            );
        }

        case ACTIONS.TRANSFER: {
            const { fromAccountId, toAccountId, amount } = action.payload;
            return state.map(acc => {
                if (acc.id === fromAccountId) {
                    return {
                        ...acc,
                        balance: acc.balance - amount,
                        lastUpdated: new Date().toISOString()
                    };
                }
                // Only update recipient if it exists in THIS user's accounts (Self Transfer)
                if (acc.id === toAccountId) {
                    return {
                        ...acc,
                        balance: acc.balance + amount,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return acc;
            });
        }

        case ACTIONS.UPDATE_ACCOUNT_MPIN: {
            const { accountId, newMpin } = action.payload;
            return state.map(acc =>
                acc.id === accountId
                    ? { ...acc, mpin: newMpin, lastUpdated: new Date().toISOString() }
                    : acc
            );
        }

        default:
            return state;
    }
}

// Transactions Reducer
function transactionsReducer(state, action) {
    switch (action.type) {
        case ACTIONS.DEPOSIT:
        case ACTIONS.WITHDRAW:
        case ACTIONS.TRANSFER: {
            const { transactionId } = action.payload; // Use provided ID or generate
            const transaction = {
                id: transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                type: action.type,
                ...action.payload,
                // Fix: Explicit date field for UI
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                status: 'completed'
            };
            return [transaction, ...state].slice(0, 100); // Keep last 100
        }
        default:
            return state;
    }
}

// Main Reducer
function bankingReducer(state, action) {
    let newState = state;

    try {
        switch (action.type) {
            case ACTIONS.LOAD_DATA:
                // When loading data, checking if there is only 1 account to auto-login
                const loadedAccounts = action.payload.accounts || [];
                let defaultActive = null;
                if (loadedAccounts.length === 1) {
                    defaultActive = loadedAccounts[0];
                }
                return { ...state, ...action.payload, activeAccount: defaultActive };

            case ACTIONS.SET_ACTIVE_ACCOUNT:
                return { ...state, activeAccount: action.payload };

            case ACTIONS.LOGOUT_ACCOUNT:
                return { ...state, activeAccount: null };

            case ACTIONS.CREATE_ACCOUNT:
            case ACTIONS.DELETE_ACCOUNT:
            case ACTIONS.UPDATE_ACCOUNT_MPIN:
            case ACTIONS.TOGGLE_ACCOUNT_STATUS:
            case ACTIONS.DEPOSIT:
            case ACTIONS.WITHDRAW:
            case ACTIONS.TRANSFER: {
                const newAccounts = accountsReducer(state.accounts, action);
                const newTransactions = transactionsReducer(state.transactions, action);

                newState = {
                    ...state,
                    accounts: newAccounts,
                    transactions: newTransactions,
                    lastUpdated: new Date().toISOString()
                };
                break;
            }

            default:
                return state;
        }
    } catch (error) {
        console.error("Reducer Error:", error);
        // Could add audit log here
        return state;
    }

    // Auto-sync on any state change
    syncToStorage(newState);
    return newState;
}

// Context
const BankingContext = createContext();

// Provider Component
export function BankingProvider({ children }) {
    const [state, dispatch] = useReducer(bankingReducer, initialState);

    // Initial Load
    useEffect(() => {
        const loadInitialData = () => {
            try {
                // 1. Try loading logged in user
                const storedUserJSON = localStorage.getItem('epic_logged_user');

                if (storedUserJSON) {
                    let userData = JSON.parse(storedUserJSON);

                    // SYNC FIX: Always refresh from "Database" (epic_all_users) to get latest balance/transactions
                    const allUsersJSON = localStorage.getItem('epic_all_users');
                    if (allUsersJSON) {
                        const allUsers = JSON.parse(allUsersJSON);
                        const freshUserData = allUsers.find(u =>
                            u.user?.crn === userData.user?.crn
                        );

                        if (freshUserData) {
                            console.log("Syncing session with latest database data...");
                            userData = freshUserData;
                            // Update session storage to match
                            localStorage.setItem('epic_logged_user', JSON.stringify(freshUserData));
                        }
                    }

                    // MIGRATION 2: Ensure all accounts have MPIN

                    // MIGRATION 2: Ensure all accounts have MPIN
                    // Defaulting to user's PIN or '1234'
                    const defaultMpin = userData.user?.pin || '1234';

                    if (userData.accounts) {
                        console.log("Raw Accounts Loaded:", userData.accounts);
                        userData.accounts = userData.accounts.map((acc, index) => {
                            // NORMALIZATION: Handle complex nested structure check
                            if (acc.accountDetails) {
                                console.log(`Normalizing Account ${index}:`, acc.accountDetails.accountNumber);
                                return {
                                    id: acc.id || `ACC_${acc.accountDetails.accountNumber}`,
                                    accountNumber: acc.accountDetails.accountNumber,
                                    accountType: acc.accountDetails.accountType,
                                    bankName: acc.accountDetails.bankName,
                                    mpin: String(acc.accountDetails.mpin || defaultMpin), // Force string
                                    balance: acc.balance?.available || 0,
                                    currency: acc.balance?.currency || 'INR',
                                    transactions: acc.transactions || [],
                                    status: 'active',
                                    lastUpdated: new Date().toISOString()
                                };
                            }

                            // Default migration for simple structure
                            let finalMpin = acc.mpin;
                            if (!finalMpin) finalMpin = defaultMpin;

                            return {
                                ...acc,
                                mpin: String(finalMpin) // Force string
                            };
                        });
                        console.log("Normalized Accounts:", userData.accounts);
                    }

                    // MIGRATION: Convert old single 'account' to 'accounts' array if needed
                    if (!userData.accounts && userData.account) {
                        userData.accounts = [{
                            id: 'ACC_PRIMARY',
                            ...userData.account,
                            balance: userData.balance?.available || 0,
                            mpin: defaultMpin
                        }];
                        // Clean up old fields to avoid confusion
                        delete userData.account;
                        delete userData.balance;
                    }
                    // Fallback if absolutely no accounts
                    else if (!userData.accounts) {
                        userData.accounts = [];
                    }

                    // Ensure transactions exist
                    if (!userData.transactions) userData.transactions = [];

                    dispatch({ type: ACTIONS.LOAD_DATA, payload: userData });
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
            }
        };

        loadInitialData();
    }, []);

    // Action creators
    const createAccount = (accountData) => {
        try {
            dispatch({ type: ACTIONS.CREATE_ACCOUNT, payload: { accountData } });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deposit = (accountId, amount, description = 'Cash Deposit') => {
        if (amount <= 0) return { success: false, error: 'Amount must be positive' };

        dispatch({
            type: ACTIONS.DEPOSIT,
            payload: { accountId, amount, description, balanceAfter: 0 } // Balance calculated in reducer
        });
        return { success: true };
    };

    const withdraw = (accountId, amount, description = 'Cash Withdrawal') => {
        if (amount <= 0) return { success: false, error: 'Amount must be positive' };

        const account = state.accounts.find(a => a.id === accountId);
        if (!account) return { success: false, error: 'Account not found' };
        if (account.balance < amount) return { success: false, error: 'Insufficient funds' };

        dispatch({
            type: ACTIONS.WITHDRAW,
            payload: { accountId, amount, description }
        });
        return { success: true };
    };

    const transfer = (fromAccountId, toAccountNumber, amount, description = 'Transfer') => {
        if (amount <= 0) return { success: false, error: 'Amount must be positive' };

        const fromAccount = state.accounts.find(a => a.id === fromAccountId);
        if (!fromAccount) return { success: false, error: 'Source account not found' };
        if (fromAccount.balance < amount) return { success: false, error: 'Insufficient funds' };

        // 1. Check if it's a "Self Transfer" (to another account of the same user)
        const toOwnAccount = state.accounts.find(a => a.accountNumber === toAccountNumber);

        if (toOwnAccount) {
            dispatch({
                type: ACTIONS.TRANSFER,
                payload: {
                    fromAccountId,
                    toAccountId: toOwnAccount.id,
                    amount,
                    description: description || `Transfer to ${toOwnAccount.accountType} (${toOwnAccount.accountNumber})`,
                    title: "Self Transfer",
                    beneficiaryName: "Self",
                    remarks: description,
                    date: new Date().toISOString().split('T')[0]
                }
            });
            return { success: true, message: 'Transfer successful' };
        }

        // 2. External Transfer (to another user)
        try {
            const allUsersJSON = localStorage.getItem('epic_all_users');
            if (allUsersJSON) {
                const allUsers = JSON.parse(allUsersJSON);
                const recipientIndex = allUsers.findIndex(u =>
                    // Check modern 'accounts' array (Nested & Normalized)
                    (u.accounts && u.accounts.some(a =>
                        String(a.accountDetails?.accountNumber) === String(toAccountNumber) ||
                        String(a.accountNumber) === String(toAccountNumber)
                    )) ||
                    // Check legacy 'account' object
                    (u.account && String(u.account.accountNumber) === String(toAccountNumber)) ||
                    // Check User Details (Mobile/UPI) - Case Insensitive & Space-insensitive handles
                    (u.user && (
                        (() => {
                            const inputDigits = String(toAccountNumber).replace(/\D/g, '');
                            const storedDigits = String(u.user.mobile).replace(/\D/g, '');
                            return inputDigits.length >= 10 && (storedDigits === inputDigits || storedDigits.endsWith(inputDigits));
                        })() ||
                        String(u.user.upi).toLowerCase() === String(toAccountNumber).toLowerCase() ||
                        String(u.user.email).toLowerCase() === String(toAccountNumber).toLowerCase()
                    ))
                );

                if (recipientIndex !== -1) {
                    const recipient = allUsers[recipientIndex];

                    // Deduct from Sender (Local State)
                    dispatch({
                        type: ACTIONS.WITHDRAW,
                        payload: {
                            accountId: fromAccountId,
                            amount,
                            description: description || `Transfer to ${recipient.user?.name || toAccountNumber}`,
                            title: `Transfer to ${recipient.user?.name || toAccountNumber}`, // Better Title
                            beneficiaryName: recipient.user?.name,
                            remarks: description
                        }
                    });

                    // Credit Recipient (Direct Storage Update)
                    if (recipient.accounts) {
                        // Try to find specific account, otherwise default to first account (for Phone/UPI transfers)
                        let acc = recipient.accounts.find(a =>
                            String(a.accountDetails?.accountNumber) === String(toAccountNumber) ||
                            String(a.accountNumber) === String(toAccountNumber)
                        );
                        if (!acc && recipient.accounts.length > 0) {
                            acc = recipient.accounts[0];
                        }

                        if (acc) {
                            acc.balance = (parseFloat(acc.balance) || 0) + parseFloat(amount);
                        }
                    } else if (recipient.account) {
                        // Legacy structure support
                        if (!recipient.balance) recipient.balance = { available: 0 };
                        recipient.balance.available += amount;
                    }

                    // Add transaction for recipient
                    if (!recipient.transactions) recipient.transactions = [];
                    recipient.transactions.unshift({
                        id: `TXN${Date.now()}R`,
                        type: 'Credit',
                        amount: amount,
                        title: `Received from ${state.user?.name || 'Unknown'}`,
                        description: `Received from ${state.user?.name || 'Unknown'}`,
                        remarks: description,
                        date: new Date().toISOString().split('T')[0],
                        timestamp: new Date().toISOString()
                    });

                    // Save all users
                    allUsers[recipientIndex] = recipient;
                    localStorage.setItem('epic_all_users', JSON.stringify(allUsers));

                    return { success: true, message: 'External transfer successful' };
                }
            }
            return { success: false, error: 'Recipient account not found' };

        } catch (e) {
            console.error(e);
            return { success: false, error: 'Transfer failed' };
        }
    };

    const deleteAccount = (accountId) => {
        const account = state.accounts.find(a => a.id === accountId);
        if (account && account.balance > 0) return { success: false, error: 'Cannot delete account with balance' };

        dispatch({ type: ACTIONS.DELETE_ACCOUNT, payload: { accountId } });
        return { success: true };
    };

    const getTotalBalance = () => state.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const getAccountTransactions = (accountId) => state.transactions;

    const verifyAccountMpin = (accountId, mpin) => {
        const account = state.accounts.find(a => a.id === accountId);
        console.log("Verify MPIN Debug:", {
            accountId,
            enteredMpin: mpin,
            storedAccount: account
        });

        if (!account) return false;

        return String(account.mpin) === String(mpin);
    };

    const loginAccount = (accountId, mpin) => {
        if (verifyAccountMpin(accountId, mpin)) {
            const account = state.accounts.find(a => a.id === accountId);
            dispatch({ type: ACTIONS.SET_ACTIVE_ACCOUNT, payload: account });
            return { success: true };
        }
        return { success: false, error: 'Invalid MPIN' };
    };

    const logoutAccount = () => {
        dispatch({ type: ACTIONS.LOGOUT_ACCOUNT });
    };

    const updateAccountMpin = (accountId, newMpin) => {
        if (!newMpin || String(newMpin).length !== 4 || isNaN(newMpin)) {
            return { success: false, error: 'MPIN must be a 4-digit number' };
        }

        const account = state.accounts.find(a => a.id === accountId);
        if (!account) return { success: false, error: 'Account not found' };

        dispatch({
            type: ACTIONS.UPDATE_ACCOUNT_MPIN,
            payload: { accountId, newMpin }
        });
        return { success: true, message: 'MPIN updated successfully' };
    };

    const toggleAccountStatus = (accountId) => {
        const account = state.accounts.find(a => a.id === accountId);
        if (!account) return { success: false, error: 'Account not found' };

        dispatch({ type: ACTIONS.TOGGLE_ACCOUNT_STATUS, payload: { accountId } });
        return { success: true, message: `Account ${account.status === 'active' ? 'Deactivated' : 'Activated'} Successfully` };
    };

    const value = {
        state,
        dispatch,
        createAccount,
        deposit,
        withdraw,
        transfer,
        deleteAccount,
        getTotalBalance,
        getAccountTransactions,
        verifyAccountMpin,
        loginAccount,
        logoutAccount,
        updateAccountMpin,
        toggleAccountStatus
    };

    return (
        <BankingContext.Provider value={value}>
            {children}
        </BankingContext.Provider>
    );
}

export function useBanking() {
    const context = useContext(BankingContext);
    if (!context) {
        throw new Error('useBanking must be used within BankingProvider');
    }
    return context;
}

export default BankingContext;