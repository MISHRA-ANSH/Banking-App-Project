// import { useState } from 'react';
// import Login from './components/Login';
// import Dashboard from './components/Dashboard';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const handleLogin = (credentials) => {
//     setIsLoggedIn(true);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//   };

//   return (
//     <div className="App">
//       {isLoggedIn ? (
//         <Dashboard />
//       ) : (
//         <Login onNext={handleLogin} />
//       )}
//     </div>
//   );
// }

// export default App;

// import { useState } from "react";

// import Login from "./Components/Login";
// import VerifyPin from "./Components/VerifyPin";
// import Dashboard from "./Components/Dashboard";
// import Navbar from "./Components/Navbar";

// function App() {
//   const [step, setStep] = useState(1);      // login flow
//   const [page, setPage] = useState("home"); // navbar pages

//   // Login
//   if (step === 1) {
//     return <Login onNext={() => setStep(2)} />;
//   }

//   // Verify PIN
//   if (step === 2) {
//     return <VerifyPin onNext={() => setStep(3)} />;
//   }

//   // After login
//   return (
//     <>
//       <Navbar onChangePage={setPage} />

//       {page === "home" && <Dashboard />}
//       {page === "transactions" && <h2>Transactions Page</h2>}
//       {page === "accounts" && <h2>Accounts Page</h2>}
//     </>
//   );
// }

// export default App;




import { useState, useEffect } from "react";
import { BankingProvider } from "./context/BankingContext";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import VerifyPin from "./Components/VerifyPin";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import Transfer from "./Components/Transfer";
import Transactions from "./Components/Transactions";
import AccountsCards from "./Components/AccountsCards";
import SettingsPage from "./Components/SettingsPage";
import Investments from "./Components/Investments";

function App() {
  // Check if user is already logged in from localStorage
  const [step, setStep] = useState(() => {
    const isLoggedIn = localStorage.getItem("epic_user_logged_in") === "true";
    return isLoggedIn ? 3 : 1; // Start at login if not logged in
  });
  const [page, setPage] = useState("home");
  // Global Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("epic_dark_mode") === "true";
  });

  // Persist Dark Mode
  useEffect(() => {
    localStorage.setItem("epic_dark_mode", darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Listen for navigation events from Dashboard
  useEffect(() => {
    const handleNavigate = (event) => {
      setPage(event.detail);
    };

    window.addEventListener('navigateTo', handleNavigate);
    return () => window.removeEventListener('navigateTo', handleNavigate);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("epic_user_logged_in");
    localStorage.removeItem("epic_user_account");
    localStorage.removeItem("epic_user_password");
    setStep(1);
    setPage("home");
  };

  // SIGN UP FLOW
  if (step === 0) {
    return <SignUp onLogin={() => setStep(1)} />;
  }

  // LOGIN FLOW
  if (step === 1) {
    return <Login onNext={() => setStep(2)} onSignUp={() => setStep(0)} />;
  }

  if (step === 2) {
    return <VerifyPin onNext={() => {
      localStorage.setItem("epic_user_logged_in", "true");
      setStep(3);
    }} />;
  }

  // AFTER LOGIN - Show Dashboard with Navbar
  return (
    <BankingProvider>
      <div style={{ minHeight: "100vh", background: darkMode ? "#0f172a" : "#f8f9fb", color: darkMode ? "#f8fafc" : "#1e293b" }}>
        <Navbar onChangePage={setPage} onLogout={handleLogout} activePage={page} darkMode={darkMode} />

        <div style={{ paddingTop: "90px", minHeight: "100vh" }}>
          {page === "home" && <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />}
          {page === "transfer" && <Transfer darkMode={darkMode} />}
          {page === "transactions" && <Transactions darkMode={darkMode} />}
          {page === "accounts" && <AccountsCards onBack={() => setPage('home')} darkMode={darkMode} />}
          {page === "settings" && <SettingsPage darkMode={darkMode} />}
          {page === "investments" && <Investments darkMode={darkMode} />}
        </div>
      </div>
    </BankingProvider>
  );
}

export default App;
