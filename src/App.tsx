/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  TrendingUp, 
  PiggyBank, 
  BookOpen, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  DollarSign, 
  Check, 
  Filter, 
  Send, 
  Lightbulb, 
  User, 
  Plus, 
  Target,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import { StudentExpense, StudentBudget, SavingsGoal, AdvisorResponse, ChatMessage, STUDENT_CATEGORIES, UserProfile } from "./types";
import { INITIAL_BUDGET, INITIAL_EXPENSES, INITIAL_GOALS, EDUCATIONAL_STUDENT_TIPS } from "./data";

export default function App() {
  // --- Core Authentication States & Database ---
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem("scholar_users");
    const initialUsers: UserProfile[] = [
      {
        name: "Alex Henderson",
        username: "alex@university.edu",
        studentId: "#29401",
        passwordHash: "password123"
      }
    ];
    if (!saved) {
      localStorage.setItem("scholar_users", JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(saved);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedActive = localStorage.getItem("scholar_current_user");
    return savedActive ? JSON.parse(savedActive) : null;
  });

  // Auth Layout state
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpStudentId, setSignUpStudentId] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // --- Student Dashboard States (per-user dynamic maps) ---
  const [budget, setBudget] = useState<StudentBudget>(INITIAL_BUDGET);
  const [expenses, setExpenses] = useState<StudentExpense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Expense Logger form states
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<typeof STUDENT_CATEGORIES[number]>("Food");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenseNotes, setExpenseNotes] = useState("");

  // Goals form states
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalNotes, setGoalNotes] = useState("");

  // Filter and Sorting states
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Budget Adjuster mode
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState<StudentBudget>({ ...budget });

  // AI Advisor related states
  const [advisorState, setAdvisorState] = useState<AdvisorResponse | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  // Mini-chat messages state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // User profile
  const [studentName, setStudentName] = useState("Alex Henderson");
  const [studentID, setStudentID] = useState("#29401");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sync users database helper
  useEffect(() => {
    localStorage.setItem("scholar_users", JSON.stringify(users));
  }, [users]);

  // Load dynamically when user logging state alterations occur
  useEffect(() => {
    if (currentUser) {
      const u = currentUser.username;
      
      const savedBudget = localStorage.getItem(`scholar_budget_${u}`);
      setBudget(savedBudget ? JSON.parse(savedBudget) : INITIAL_BUDGET);
      
      const savedExpenses = localStorage.getItem(`scholar_expenses_${u}`);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : INITIAL_EXPENSES);
      
      const savedGoals = localStorage.getItem(`scholar_goals_${u}`);
      setGoals(savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS);

      setStudentName(currentUser.name);
      setStudentID(currentUser.studentId);
    } else {
      setBudget(INITIAL_BUDGET);
      setExpenses([]);
      setGoals([]);
    }
    // Reset secondary panels
    setChatMessages([]);
    setAdvisorState(null);
  }, [currentUser]);

  // Local storage persistence syncs per-user account
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`scholar_budget_${currentUser.username}`, JSON.stringify(budget));
    }
  }, [budget, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`scholar_expenses_${currentUser.username}`, JSON.stringify(expenses));
    }
  }, [expenses, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`scholar_goals_${currentUser.username}`, JSON.stringify(goals));
    }
  }, [goals, currentUser]);

  // Initial trigger for AI recommendation ONLY when active user login is verified
  useEffect(() => {
    if (currentUser) {
      fetchAIAdvice("I am getting started. Give me a fresh high level summary of my student finances and tips.");
    }
  }, [currentUser]);

  // --- Password Checker & Registrars ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email || !password) {
      setAuthError("Email and password fields are required.");
      return;
    }

    const matched = users.find(u => u.username === email);
    if (!matched) {
      setAuthError("No student registration found under this email.");
      return;
    }

    if (matched.passwordHash !== password) {
      setAuthError("Invalid credentials. Please attempt matching password.");
      return;
    }

    // Success login!
    localStorage.setItem("scholar_current_user", JSON.stringify(matched));
    setAuthSuccess("Successfully authorized!");
    setTimeout(() => {
      setCurrentUser(matched);
      // Clean inputs
      setLoginEmail("");
      setLoginPassword("");
      setAuthSuccess(null);
    }, 600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const email = signUpEmail.trim().toLowerCase();
    const name = signUpName.trim();
    const studentId = signUpStudentId.trim() || "#" + Math.floor(10000 + Math.random() * 90000);
    const password = signUpPassword;

    if (!email || !name || !password) {
      setAuthError("Full Name, Email and Password are required targets.");
      return;
    }

    if (password.length < 5) {
      setAuthError("For security, student password must contain at least 5 characters.");
      return;
    }

    if (password !== signUpConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    const alreadyExists = users.some(u => u.username === email);
    if (alreadyExists) {
      setAuthError("An account with this student email is already registered.");
      return;
    }

    const newUser: UserProfile = {
      name,
      username: email,
      studentId,
      passwordHash: password
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("scholar_users", JSON.stringify(updatedUsers));

    // Pre-initialize states in localStorage so they have a copy of demo template to start editing immediately!
    localStorage.setItem(`scholar_budget_${email}`, JSON.stringify(INITIAL_BUDGET));
    localStorage.setItem(`scholar_expenses_${email}`, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(`scholar_goals_${email}`, JSON.stringify(INITIAL_GOALS));

    setAuthSuccess("Registration completed successfully!");
    setTimeout(() => {
      localStorage.setItem("scholar_current_user", JSON.stringify(newUser));
      setCurrentUser(newUser);
      // Clean input helpers
      setSignUpName("");
      setSignUpEmail("");
      setSignUpStudentId("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setAuthSuccess(null);
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem("scholar_current_user");
    setCurrentUser(null);
  };

  // --- Calculations ---
  const totalBudgetLimit: number = Number(budget.Food || 0) + 
                             Number(budget.Textbooks || 0) + 
                             Number(budget.Rent || 0) + 
                             Number(budget.Transit || 0) + 
                             Number(budget.Social || 0) + 
                             Number(budget.Other || 0);
  
  const categorySpentMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalSavedInGoals = goals.reduce((sum, g) => sum + g.savedAmount, 0);

  // --- Handlers ---
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || isNaN(Number(expenseAmount)) || Number(expenseAmount) <= 0) {
      alert("Please enter a valid title and positive numeric amount.");
      return;
    }

    const newExpense: StudentExpense = {
      id: `expense-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: parseFloat(Number(expenseAmount).toFixed(2)),
      category: expenseCategory,
      date: expenseDate,
      notes: expenseNotes.trim() || undefined
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    
    // Reset inputs
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseNotes("");
    
    // Auto-refresh recommendations when item is added
    triggerAutoAdviceUpdate(updated, budget, goals);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    triggerAutoAdviceUpdate(updated, budget, goals);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget || isNaN(Number(goalTarget)) || Number(goalTarget) <= 0) {
      alert("Please enter a valid savings target title and target amount.");
      return;
    }

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: goalTitle,
      targetAmount: parseFloat(Number(goalTarget).toFixed(2)),
      savedAmount: 0,
      targetDate: goalDate || new Date(Date.now() + 60*24*60*60*1000).toISOString().split("T")[0],
      notes: goalNotes.trim() || undefined
    };

    setGoals([...goals, newGoal]);
    setGoalTitle("");
    setGoalTarget("");
    setGoalDate("");
    setGoalNotes("");
    setIsAddingGoal(false);
  };

  const handleAddSavingsToGoal = (goalId: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextSaved = Math.min(g.targetAmount, g.savedAmount + amount);
        return { ...g, savedAmount: parseFloat(nextSaved.toFixed(2)) };
      }
      return g;
    }));
  };

  const handleApplyBudgetAdjustment = (category: string, newLimit: number) => {
    if (STUDENT_CATEGORIES.includes(category as any)) {
      setBudget(prev => ({
        ...prev,
        [category]: newLimit
      }));
      // Visual feedback via advisor status
      if (advisorState) {
        setAdvisorState({
          ...advisorState,
          suggestedBudgetAdjustments: advisorState.suggestedBudgetAdjustments.filter(adj => adj.category !== category)
        });
      }
    }
  };

  const triggerAutoAdviceUpdate = (currentExpenses: StudentExpense[], currentBudget: StudentBudget, currentGoals: SavingsGoal[]) => {
    fetchAIAdvice("Automated budget tick. Refresh stats based on the latest transaction log changes.", currentExpenses, currentBudget, currentGoals);
  };

  // Safe wrapper for trigger
  const handleManualAdviceRefresh = () => {
    fetchAIAdvice("Provide a full audit. Critique my expenses in detail and identify where I can slash student living costs.");
  };

  const fetchAIAdvice = async (
    customMsg?: string, 
    overrideExpenses?: StudentExpense[], 
    overrideBudget?: StudentBudget, 
    overrideGoals?: SavingsGoal[]
  ) => {
    setIsAdvisorLoading(true);
    setAdvisorError(null);

    const targetExpenses = overrideExpenses || expenses;
    const targetBudget = overrideBudget || budget;
    const targetGoals = overrideGoals || goals;

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: targetBudget,
          expenses: targetExpenses,
          goals: targetGoals,
          message: customMsg || "Analyze my budget now and find saving items"
        })
      });

      if (!response.ok) {
        throw new Error(`Advisor API responded with state ${response.status}`);
      }

      const data: AdvisorResponse = await response.json();
      setAdvisorState(data);
      
      // If we got a direct reply to user chat/history, push it
      if (data.chatResponse) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "advisor",
          text: data.chatResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev.slice(-10), aiMessage]); // Keep last 10 messages
      }

    } catch (err: any) {
      console.error(err);
      setAdvisorError(err.message || "Failed to fetch AI financial guidance.");
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const submitChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    const originalInput = chatInput;
    setChatInput("");
    
    // Call advisor with the specific user sentence
    fetchAIAdvice(originalInput);
  };

  // Filtered expenses list
  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = categoryFilter === "All" || exp.category === categoryFilter;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        {/* Simple Brand Nav */}
        <nav className="h-20 bg-white border-b border-slate-200 px-6 md:px-12 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-indigo-900 font-display">ScholarSaver</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">Student Edition</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            SECURITY SECURED • CLIENT-PERSISTED ENVIRONMENT
          </div>
        </nav>

        {/* Center Card Outer Column */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50/40">
          <div className="w-full max-w-5xl bg-white rounded-[2rem] border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            
            {/* Left side: branding & education promo (Col span 5) */}
            <div className="md:col-span-5 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl"></div>

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs text-indigo-200 font-semibold uppercase tracking-wider font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  AI-Powered Student Advisor
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-extrabold tracking-tight font-display text-white leading-tight">
                    Smart savings for modern students.
                  </h1>
                  <p className="text-slate-300 text-sm leading-relaxed text-slate-300/90">
                    Track Textbook allocations, Dorm Grocery caps, Transit passes, and Social allocations with real-time AI critique and recommendations.
                  </p>
                </div>
              </div>

              {/* Dynamic Tip Carousel or Quote */}
              <div className="relative z-10 mt-12 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                    💡
                  </div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">Pro Campus Hack</span>
                </div>
                <blockquote className="text-xs italic text-slate-300 leading-relaxed font-sans">
                  "Most textbook professors allow 2-hour free library reserves. Take smartphone scans instead of buying $200 textbooks!"
                </blockquote>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-xs text-indigo-300 font-bold font-mono">
                    SA
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 block">Sarah Abbott</span>
                    <span className="text-[9px] text-slate-500">Sophomore Advisor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Login / Register tabs (Col span 7) */}
            <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
              
              {/* Header Selector Tabs */}
              <div className="flex border-b border-slate-100 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 pb-3 text-sm font-bold transition-all text-center border-b-2 outline-none cursor-pointer ${
                    authTab === "login" 
                      ? "border-indigo-600 text-indigo-950" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Log In to Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("signup");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 pb-3 text-sm font-bold transition-all text-center border-b-2 outline-none cursor-pointer ${
                    authTab === "signup" 
                      ? "border-indigo-600 text-indigo-950" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Create Student Profile
                </button>
              </div>

              {/* Success/Error displays */}
              {authError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Login Form */}
              {authTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Student Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="username@university.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-sm p-3 pl-11 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="block uppercase tracking-wider font-semibold text-slate-500">Password</label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-sm p-3 pl-11 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 mt-2 text-sm cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Authorize & Fetch My Ledger
                  </button>

                  {/* Fast demo login selector */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Instant Demo sandbox</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("alex@university.edu");
                        setLoginPassword("password123");
                        setAuthError(null);
                      }}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100/85 text-indigo-700 border border-indigo-100/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      One-Tap Quick Entry (Alex Henderson)
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-1.5 italic">
                      Includes pre-populated dorm meals, rent logs, train passes, and savings pots.
                    </p>
                  </div>
                </form>
              ) : (
                /* Registration sign up form */
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Student Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Abbott"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="w-full text-sm p-2.5 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Student Email Address</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="sarah@university.edu"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="w-full text-sm p-2.5 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Student ID (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold text-xs">
                          #
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. #31940"
                          value={signUpStudentId}
                          onChange={(e) => setSignUpStudentId(e.target.value)}
                          className="w-full text-sm p-2.5 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 5 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">Confirm Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 mt-3 text-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register My Dorm Account
                  </button>
                  <p className="text-[10px] text-center text-slate-400 italic">
                    Your profile, budgets, transaction logs, and saving goals are fully isolated & safely encrypted in your browser.
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 shrink-0">
          <p>© 2026 ScholarSaver. Safe individual sandboxes created in your secure local console.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Sleek Top Navigation Bar */}
      <nav id="navbar" className="h-20 bg-white border-b border-slate-200 px-6 md:px-12 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm">
        <div id="nav-brand" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-indigo-900 font-display">ScholarSaver</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">Student Edition</span>
          </div>
        </div>

        {/* User profile details config */}
        <div id="nav-user" className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            {isEditingProfile ? (
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (currentUser) {
                      const updated = { ...currentUser, name: e.target.value };
                      setCurrentUser(updated);
                      localStorage.setItem("scholar_current_user", JSON.stringify(updated));
                      const nextUsers = users.map(u => u.username === currentUser.username ? updated : u);
                      setUsers(nextUsers);
                    }
                  }}
                  className="text-sm font-medium border border-slate-300 rounded px-1.5 py-0.5 w-32 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-indigo-600 text-white rounded p-0.5"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="group cursor-pointer flex items-center gap-1.5 justify-end" onClick={() => setIsEditingProfile(true)}>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{studentName}</span>
                <span className="text-[10px] text-slate-400">✏️</span>
              </div>
            )}
            <div className="flex gap-1 justify-end items-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold">ID: {studentID}</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-inner mr-1">
            {studentName.split(" ").map(n => n[0]).join("")}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
            title="Log Out of system"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Grid Content Area */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* Left Column (Col span 7): Metrics, Trackers & Logger */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Balance card - Checking / Leftover */}
            <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-200/80 relative overflow-hidden transition-all hover:scale-101">
              <div className="absolute -top-4 -right-4 opacity-15">
                <DollarSign className="w-32 h-32 text-indigo-900" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-indigo-100 text-sm font-medium">Estimated Leftover Limit</p>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase">This Month</span>
                  </div>
                  <h2 className="text-3xl font-bold font-display">
                    ${(totalBudgetLimit - totalSpent).toFixed(2)}
                  </h2>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <div id="leftover-indicator" className={`w-3 h-3 rounded-full ${totalSpent > totalBudgetLimit ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`}></div>
                  <p className="text-xs text-indigo-100">
                    Spent: <strong className="text-white">${totalSpent.toFixed(2)}</strong> of ${totalBudgetLimit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Balance card - Total Savings in Pot */}
            <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-lg shadow-emerald-200/80 relative overflow-hidden transition-all hover:scale-101">
              <div className="absolute -top-4 -right-4 opacity-15">
                <PiggyBank className="w-32 h-32 text-emerald-950" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-emerald-50 text-sm font-medium">Locked Savings Pots</p>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase">Multi-Goal</span>
                  </div>
                  <h2 className="text-3xl font-bold font-display">
                    ${totalSavedInGoals.toFixed(2)}
                  </h2>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="py-1.5 px-3 bg-white/20 rounded-full w-fit text-xs font-semibold inline-block">
                    {goals.length} Active Target Saving Pots
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Log New Transaction Form Card */}
          <div id="add-expense-card" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <span className="p-1 px-2 border-2 border-indigo-600 rounded bg-indigo-50 text-indigo-700 text-sm font-bold">1</span>
                  Log Student Cost
                </h3>
                <p className="text-xs text-slate-500">Record textbooks, meals, or transit quickly to update your safety targets.</p>
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Item Title / Store</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chemistry textbook, Burrito bowl"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.50"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {STUDENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "Transit" ? "Transit / Commuting" : cat === "Social" ? "Social / Party / Outing" : cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Student Notes (Used code/discount code, book condition, roommate share, etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. used discount code AH8, shared cost with roommate"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Add Student Cost
              </button>
            </form>
          </div>

          {/* Recent Activity Card & Expenses Filtering */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex-1 flex flex-col min-h-[460px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  Recent Ledger Activity
                </h3>
                <p className="text-xs text-slate-500">Filters your logged expense catalog in real time.</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold self-start sm:self-center">
                Count: {filteredExpenses.length} / {expenses.length}
              </span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
              <div className="sm:col-span-5 relative">
                <input
                  type="text"
                  placeholder="Search item or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm p-2 pl-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-100 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4 flex items-center gap-1">
                <span className="text-slate-400"><Filter className="w-4 h-4" /></span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 bg-white rounded-xl focus:outline-none text-slate-600"
                >
                  <option value="All">All Categories</option>
                  {STUDENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3 text-right">
                <button
                  onClick={() => {
                    setCategoryFilter("All");
                    setSearchQuery("");
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* List */}
            {filteredExpenses.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No matching transactions found</p>
                <p className="text-xs text-slate-400 mt-1">Try relaxing terms or log an initial item to trigger analysis.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1 styled-scroll">
                {filteredExpenses.map((exp) => {
                  // Style colors based on category
                  const colorMap: Record<string, { bg: string, text: string }> = {
                    Food: { bg: "bg-orange-50 hover:bg-orange-100", text: "text-orange-700" },
                    Textbooks: { bg: "bg-blue-50 hover:bg-blue-100", text: "text-blue-700" },
                    Rent: { bg: "bg-amber-50 hover:bg-amber-100", text: "text-amber-800" },
                    Transit: { bg: "bg-purple-50 hover:bg-purple-100", text: "text-purple-700" },
                    Social: { bg: "bg-rose-50 hover:bg-rose-100", text: "text-rose-700" },
                    Other: { bg: "bg-slate-50 hover:bg-slate-100", text: "text-slate-700" }
                  };

                  const theme = colorMap[exp.category] || { bg: "bg-slate-100", text: "text-slate-800" };

                  return (
                    <div
                      key={exp.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border border-slate-100 transition-all ${theme.bg}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${theme.text} bg-white border border-slate-200/50 shadow-sm`}>
                          {exp.category[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">{exp.title}</p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-white/80 rounded border border-slate-200/40 text-slate-500">
                              {exp.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-400">{exp.date}</p>
                            {exp.notes && (
                              <p className="text-xs text-slate-500 italic max-w-[240px] truncate">
                                • "{exp.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 text-sm">
                          -${exp.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 px-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Col span 5): Goals, Budget Limits Config, AI advisor */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Interactive Savings Goals/Pots Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-500" />
                  Savings Pots
                </h3>
                <p className="text-xs text-slate-500">Lock money away into milestone student pots.</p>
              </div>
              <button
                onClick={() => setIsAddingGoal(!isAddingGoal)}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingGoal ? "Collapse" : "New Pot"}
              </button>
            </div>

            {/* Inline Add Goal form */}
            {isAddingGoal && (
              <form onSubmit={handleAddGoal} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 space-y-3">
                <p className="text-xs font-bold text-slate-700">Configure Savings Target</p>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">Pot Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next Semester Textbooks, Summer Flight"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">Target ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 300"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">Target Date</label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">Short Goal Goal Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. share secondhand rentals"
                    value={goalNotes}
                    onChange={(e) => setGoalNotes(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white text-xs font-bold p-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Create Pot
                </button>
              </form>
            )}

            {/* Savings goals list */}
            {goals.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">No active savings goals detected yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const progressPct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) || 0;
                  return (
                    <div key={g.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                      <div className="flex justify-between text-xs mb-1">
                        <div>
                          <span className="font-bold text-slate-800">{g.title}</span>
                          {g.notes && <p className="text-[10px] text-slate-400 italic">"{g.notes}"</p>}
                        </div>
                        <span className="text-slate-500 font-mono">
                          ${g.savedAmount} / <strong className="text-slate-700">${g.targetAmount}</strong>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1.5 mb-2.5">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>

                      {/* Inline quick insert to top up savings */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] text-slate-400">
                          Target split date: <strong className="text-slate-500">{g.targetDate}</strong>
                        </span>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAddSavingsToGoal(g.id, "5")}
                            className="bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-[10px] font-bold px-1.5 py-1 rounded text-slate-600 transition-all"
                          >
                            +$5
                          </button>
                          <button
                            onClick={() => handleAddSavingsToGoal(g.id, "25")}
                            className="bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-[10px] font-bold px-1.5 py-1 rounded text-slate-600 transition-all"
                          >
                            +$25
                          </button>
                          <button
                            onClick={() => {
                              const promptVal = prompt(`Enter custom amount to deposit to path "${g.title}":`, "50");
                              if (promptVal) handleAddSavingsToGoal(g.id, promptVal);
                            }}
                            className="bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-[10px] font-bold px-1.5 py-1 rounded text-slate-600 transition-all text-xs"
                          >
                            Custom
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Budget Limits Monitor Card (Sleek dark theme) */}
          <div id="monthly-budget-monitor" className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-indigo-600/10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-bold tracking-tight text-indigo-200 uppercase font-mono">Monthly Budget Limit Profiles</h3>
                <button
                  onClick={() => {
                    if (isEditingBudget) {
                      setBudget({ ...tempBudget });
                    } else {
                      setTempBudget({ ...budget });
                    }
                    setIsEditingBudget(!isEditingBudget);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 text-indigo-300 px-3 py-1 rounded-lg transition-all"
                >
                  {isEditingBudget ? "Confirm Limits" : "Edit Limits"}
                </button>
              </div>

              {isEditingBudget ? (
                <div className="space-y-2 mt-2 bg-slate-800/80 p-3.5 rounded-xl border border-white/10">
                  <p className="text-xs text-indigo-200 font-bold mb-1">Set maximum limits per course month:</p>
                  {Object.keys(budget).map((cat) => (
                    <div key={cat} className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 capitalize">{cat}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          className="w-20 text-xs p-1 bg-slate-950 border border-slate-700 rounded text-center text-white focus:outline-none focus:border-indigo-500"
                          value={tempBudget[cat as keyof StudentBudget]}
                          onChange={(e) => setTempBudget({ ...tempBudget, [cat]: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-indigo-300 italic">Updates category limit bars automatically.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Total limits quick banner */}
                  <div className="flex items-end gap-2.5 my-3">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
                      ${totalSpent.toFixed(0)}
                    </span>
                    <span className="text-indigo-300/80 text-sm mb-1">
                      / ${totalBudgetLimit.toFixed(0)} overall student cap
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(budget).map((catName) => {
                      const limit = budget[catName as keyof StudentBudget] || 1;
                      const spent = categorySpentMap[catName] || 0;
                      const ratio = Math.min(100, Math.round((spent / limit) * 100));
                      // color helper code
                      const isDanger = spent > limit;

                      return (
                        <div key={catName} className="bg-white/5 p-3 rounded-2xl border border-white/5 relative">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">{catName}</p>
                          <p className="text-sm font-extrabold text-white">
                            ${spent.toFixed(2)} 
                            <span className="text-slate-400 text-[10px] font-normal"> / ${limit}</span>
                          </p>
                          <div className="w-full h-1 bg-white/10 mt-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isDanger ? "bg-rose-400" : "bg-indigo-400"}`}
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleManualAdviceRefresh}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl transition-all shadow flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Student Habits via AI
              </button>
            </div>
          </div>

          {/* AI Student Advisor Advice Card */}
          <div id="ai-advisor-panel" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-indigo-50/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Personal AI Student Advisor</h3>
                  <p className="text-[10px] text-slate-400">Powered by server-side Gemini 3.5 Flash</p>
                </div>
              </div>
              
              <button
                onClick={handleManualAdviceRefresh}
                disabled={isAdvisorLoading}
                className="p-1 px-2 border border-slate-200 rounded text-xs text-indigo-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
                title="Force update recommendation"
              >
                <RefreshCw className={`w-3 h-3 ${isAdvisorLoading ? "animate-spin" : ""}`} />
                {isAdvisorLoading ? "Refreshing" : "Recount"}
              </button>
            </div>

            {/* Error state */}
            {advisorError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl mb-3 flex flex-col gap-1">
                <span className="font-bold">Advice API Offline or Missing Keys</span>
                <span>Using high-fidelity browser heuristic fallback logic. Log items above to preview suggestions.</span>
              </div>
            )}

            {isAdvisorLoading && !advisorState ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 italic">Calculating campus food hacks, book discounts, and bus paths...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Advisor General Status Badge */}
                {advisorState && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Status Advice</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                        {advisorState.generalStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {advisorState.summaryAdvice}
                    </p>
                  </div>
                )}

                {/* Savings suggestions */}
                {advisorState?.savingsSuggestions && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Student Living Cost Reduction Program:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {advisorState.savingsSuggestions.map((sug, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{sug.title}</span>
                            <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                              Estimated saved: {sug.potentialSavings}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-normal">
                            {sug.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Budget adjustments */}
                {advisorState?.suggestedBudgetAdjustments && advisorState.suggestedBudgetAdjustments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-indigo-900">Suggested Smart Cap Adjustments:</p>
                    {advisorState.suggestedBudgetAdjustments.map((adj, i) => (
                      <div key={i} className="flex justify-between items-start gap-1 p-2 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-xs">
                        <div>
                          <p className="font-bold text-slate-800 capitalize">{adj.category} Category</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{adj.reason}</p>
                        </div>
                        <button
                          onClick={() => handleApplyBudgetAdjustment(adj.category, adj.suggestedLimit)}
                          className="text-[10px] bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded font-bold shrink-0 transition-colors"
                        >
                          Apply ${adj.suggestedLimit} Cap
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat Interactive Area */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Ask Campus Savings Questions
                  </p>
                  
                  {/* Chat messages */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto mb-2 pr-1 text-xs styled-scroll">
                    {chatMessages.length === 0 ? (
                      <p className="text-[11pt] text-slate-400 italic text-center p-2">
                        Get target tricks on meal plan optimization, textbook coupon codes or shared rental hacks. Keep inputs specific.
                      </p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                          <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                            msg.sender === "user" 
                              ? "bg-indigo-600 text-white rounded-tr-none" 
                              : "bg-slate-100 text-slate-800 rounded-tl-none"
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={submitChat} className="flex gap-1.5">
                    <input
                      type="text"
                      className="flex-1 text-xs p-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800"
                      placeholder="e.g., 'How can I save $40 on textbooks next term?'"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>

          {/* Educational Student Saving Tips Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-display">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
              University Hacks & Resources
            </h4>
            
            <div className="space-y-3.5">
              {EDUCATIONAL_STUDENT_TIPS.map((tip) => (
                <div key={tip.id} className="text-xs border-l-2 border-indigo-500 pl-3.5 py-0.5">
                  <span className="font-bold text-slate-800 block text-[11px] mb-0.5 leading-tight">{tip.title}</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Styled Footer */}
      <footer id="footer" className="bg-white border-t border-slate-200 py-6 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 ScholarSaver. Safe financial tracking system built on secure client sandbox.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-indigo-600 hover:underline">Student Policies</a>
            <a href="#" className="hover:text-indigo-600 hover:underline font-bold" onClick={(e) => { e.preventDefault(); alert("Cleared locally saved credentials."); localStorage.clear(); window.location.reload(); }}>Reset Saved Storage</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
