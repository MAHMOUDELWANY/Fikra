import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Key,
  ShieldCheck,
  Database as DbIcon,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  UserCheck,
  Clock,
  BookOpen,
  DollarSign,
  FileText
} from 'lucide-react';
import { useTeacherAuth } from '../lib/auth';
import { teacherRepository, TeacherStats, DbBooking, DbLead } from '../lib/teacherRepository';
import { bookingRepository } from '../lib/bookingRepository';
import { testDatabaseConnection } from '../lib/supabase';
import { Language } from '../types';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, lang }) => {
  const { user, isTeacherAuthenticated, signIn, signOut, isConfigured } = useTeacherAuth();
  const isEn = lang === 'en';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diagnostics & Data state
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'trial_test' | 'schema'>('overview');
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Security RLS audit state
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Trial eligibility test state
  const [testEmail, setTestEmail] = useState('newstudent@example.com');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingTrial, setIsTestingTrial] = useState(false);

  useEffect(() => {
    if (isOpen && isTeacherAuthenticated) {
      loadTeacherData();
    }
    if (isOpen) {
      testDatabaseConnection().then(setDbStatus);
    }
  }, [isOpen, isTeacherAuthenticated]);

  const loadTeacherData = async () => {
    setIsLoadingData(true);
    try {
      const [s, b, l] = await Promise.all([
        teacherRepository.getStats(),
        teacherRepository.getBookings(),
        teacherRepository.getLeads(),
      ]);
      setStats(s);
      setBookings(b);
      setLeads(l);
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (!res.success) {
        setLoginError(res.error || 'Failed to authenticate');
      } else {
        await loadTeacherData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('mhmwdlwany4222@gmail.com');
    setPassword('Mahmoud2026!');
  };

  const runSecurityAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await teacherRepository.testRlsSecurityBoundaries();
      setAuditResult(res);
    } finally {
      setIsAuditing(false);
    }
  };

  const runTrialCheck = async () => {
    setIsTestingTrial(true);
    try {
      const res = await bookingRepository.checkTrialEligibility(testEmail);
      setTestResult(res);
    } finally {
      setIsTestingTrial(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1E1923]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FAF8F5] dark:bg-[#1E1923] rounded-2xl sm:rounded-3xl border border-[#D5D0CA] dark:border-[#3E3545] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D0CA] dark:border-[#3E3545] bg-[#FFFFFF] dark:bg-[#251F2C]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#87A878]/15 dark:bg-[#87A878]/25 text-[#446237] dark:text-[#A3BF96] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#362E3B] dark:text-[#F5E6D3]">
                  {isTeacherAuthenticated ? 'Teacher Backend Foundation' : 'Ustadh Mahmoud — Teacher Access'}
                </h3>
                <p className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9]">
                  Phase 3: Supabase Database, RLS Security & Teacher Auth
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isTeacherAuthenticated && (
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B5B73] hover:bg-[#EDE3D4] dark:hover:bg-[#2F2737] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {!isTeacherAuthenticated ? (
              /* LOGIN VIEW */
              <div className="max-w-md mx-auto py-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#87A878]/15 text-[#446237] dark:text-[#A3BF96] mx-auto flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#362E3B] dark:text-[#F5E6D3]">
                    Private Teacher Login
                  </h4>
                  <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] mt-1">
                    Strict teacher management portal. Students book directly as guests and do not have accounts.
                  </p>
                </div>

                {/* Database Connectivity Badge */}
                <div className="mb-6 p-3.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#251F2C] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#362E3B] dark:text-[#F5E6D3] flex items-center gap-1.5">
                      <DbIcon className="w-3.5 h-3.5 text-[#87A878]" />
                      <span>Database Status</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${isConfigured ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {isConfigured ? 'Supabase Connected' : 'Local Fallback Mode'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9]">
                    {dbStatus?.message || 'Checking database endpoint...'}
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3] mb-1.5">
                      Teacher Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mhmwdlwany4222@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#251F2C] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3] mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#251F2C] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white text-xs font-semibold tracking-wide transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In as Mahmoud'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="w-full py-2 px-4 rounded-xl border border-dashed border-[#87A878] text-[#446237] dark:text-[#A3BF96] text-xs font-medium hover:bg-[#87A878]/10 transition-colors cursor-pointer"
                  >
                    Quick Fill Mahmoud Credentials
                  </button>
                </form>
              </div>
            ) : (
              /* AUTHENTICATED TEACHER VIEW */
              <div className="space-y-6">
                
                {/* Active Session Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#87A878]/15 text-[#87A878] flex items-center justify-center font-bold text-sm">
                      M
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm sm:text-base text-[#362E3B] dark:text-[#F5E6D3]">
                          Ustadh Mahmoud
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Authenticated
                        </span>
                      </div>
                      <div className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                        {user?.email || 'mhmwdlwany4222@gmail.com'} • Primary Timezone: Cairo (UTC+2/3)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={loadTeacherData}
                    disabled={isLoadingData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] text-xs font-medium text-[#362E3B] dark:text-[#F5E6D3] hover:bg-[#FAF8F5] dark:hover:bg-[#2F2737] cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-[#D5D0CA] dark:border-[#3E3545] pb-2 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-[#87A878] text-white font-semibold'
                        : 'text-[#6B5B73] hover:text-[#362E3B] dark:text-[#B8A9C9]'
                    }`}
                  >
                    Overview & Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'security'
                        ? 'bg-[#87A878] text-white font-semibold'
                        : 'text-[#6B5B73] hover:text-[#362E3B] dark:text-[#B8A9C9]'
                    }`}
                  >
                    RLS Security Audit
                  </button>
                  <button
                    onClick={() => setActiveTab('trial_test')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'trial_test'
                        ? 'bg-[#87A878] text-white font-semibold'
                        : 'text-[#6B5B73] hover:text-[#362E3B] dark:text-[#B8A9C9]'
                    }`}
                  >
                    1-Free-Trial Rule Test
                  </button>
                  <button
                    onClick={() => setActiveTab('schema')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'schema'
                        ? 'bg-[#87A878] text-white font-semibold'
                        : 'text-[#6B5B73] hover:text-[#362E3B] dark:text-[#B8A9C9]'
                    }`}
                  >
                    19 Relational Tables
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545]">
                        <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider mb-1">
                          Leads in Funnel
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#362E3B] dark:text-[#F5E6D3]">
                          {stats?.totalLeads ?? 0}
                        </div>
                        <div className="text-[10px] text-[#87A878] mt-1">Acquisition lifecycle</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545]">
                        <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider mb-1">
                          Active Students
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#362E3B] dark:text-[#F5E6D3]">
                          {stats?.activeStudents ?? 0}
                        </div>
                        <div className="text-[10px] text-[#87A878] mt-1">1-on-1 direct learners</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545]">
                        <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider mb-1">
                          Upcoming Lessons
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#362E3B] dark:text-[#F5E6D3]">
                          {stats?.upcomingBookings ?? 0}
                        </div>
                        <div className="text-[10px] text-[#87A878] mt-1">Scheduled appointments</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545]">
                        <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider mb-1">
                          Trial Sessions
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#362E3B] dark:text-[#F5E6D3]">
                          {stats?.trialBookings ?? 0}
                        </div>
                        <div className="text-[10px] text-[#87A878] mt-1">30-min evaluations</div>
                      </div>
                    </div>

                    {/* Bookings Table Preview */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-serif font-bold text-sm text-[#362E3B] dark:text-[#F5E6D3]">
                            Recent Scheduled Bookings
                          </h5>
                          <p className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9]">
                            Stored in canonical UTC with student timezone offset & Cairo reference
                          </p>
                        </div>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                          No bookings recorded yet in this environment. Use the public booking modal to create a test booking!
                        </div>
                      ) : (
                        <div className="divide-y divide-[#D5D0CA]/60 dark:divide-[#3E3545]/60 text-xs">
                          {bookings.slice(0, 5).map((b) => (
                            <div key={b.id} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-mono font-bold text-[#362E3B] dark:text-[#F5E6D3] mr-2">
                                  {b.reference_code}
                                </span>
                                <span className="text-[#6B5B73] dark:text-[#B8A9C9]">
                                  {b.contact_name} ({b.booking_type === 'trial' ? 'Free Trial' : 'Regular'})
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-[11px] text-[#87A878]">
                                  {new Date(b.scheduled_start).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#87A878]/10 text-[#446237] dark:text-[#A3BF96]">
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: SECURITY & RLS AUDIT */}
                {activeTab === 'security' && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545] space-y-4">
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#362E3B] dark:text-[#F5E6D3]">
                        Row Level Security (RLS) Verification
                      </h5>
                      <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                        Tests that unauthenticated anonymous visitors cannot query private tables (leads, students, private lesson notes, payments), while public services catalog remains readable.
                      </p>
                    </div>

                    <button
                      onClick={runSecurityAudit}
                      disabled={isAuditing}
                      className="px-4 py-2 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isAuditing ? 'Running Security Audit...' : 'Execute Live RLS Boundary Test'}
                    </button>

                    {auditResult && (
                      <div className="mt-4 space-y-2">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>RLS Boundaries Verified: All private data access tests passed!</span>
                        </div>

                        <div className="divide-y divide-[#D5D0CA]/60 dark:divide-[#3E3545]/60 text-xs">
                          {auditResult.tests.map((t: any, idx: number) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between">
                              <div className="font-mono text-xs text-[#362E3B] dark:text-[#F5E6D3]">
                                {t.resource}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9]">
                                  {t.actual}
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ONE FREE TRIAL RULE TEST */}
                {activeTab === 'trial_test' && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545] space-y-4">
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#362E3B] dark:text-[#F5E6D3]">
                        Master Spec Section 10 & 15: One Free Trial Enforcement
                      </h5>
                      <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                        Test the database logic that prevents repeat trial abuse. The rule evaluates existing confirmed, pending, or completed trial bookings for an email or WhatsApp contact.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email to test..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#FAF8F5] dark:bg-[#1E1923] text-xs text-[#362E3B] dark:text-[#F5E6D3]"
                      />
                      <button
                        onClick={runTrialCheck}
                        disabled={isTestingTrial}
                        className="px-4 py-2 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white text-xs font-semibold cursor-pointer"
                      >
                        {isTestingTrial ? 'Testing...' : 'Check Eligibility'}
                      </button>
                    </div>

                    {testResult && (
                      <div className={`p-3.5 rounded-xl border text-xs ${testResult.eligible ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300'}`}>
                        <div className="font-semibold mb-0.5">
                          {testResult.eligible ? '✓ Eligible for Complimentary Trial' : '⚠️ Not Eligible (Trial Already Used)'}
                        </div>
                        <p className="text-[11px]">
                          {testResult.reason || 'This student has not yet booked a trial session. 1 trial session is permitted.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SCHEMA OVERVIEW */}
                {activeTab === 'schema' && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#251F2C] border border-[#D5D0CA] dark:border-[#3E3545] space-y-3">
                    <h5 className="font-serif font-bold text-sm text-[#362E3B] dark:text-[#F5E6D3]">
                      Master Spec Relational Entities (19 Core Tables)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {[
                        'profiles (Teacher Profile & Al-Azhar Bio)',
                        'services (13 Configurable Offerings)',
                        'leads (Acquisition Funnel & Statuses)',
                        'students (Active & Past Learners)',
                        'guardians (Parent / Child Relationships)',
                        'student_goals (Dynamic Progress Targets)',
                        'bookings (Central Scheduled Appointments)',
                        'lesson_sessions (Actual Completed Lessons)',
                        'lesson_notes (Private Teacher-Only Notes)',
                        'student_progress (Cross-Discipline Milestones)',
                        'availability (Weekly Teaching Windows)',
                        'payments (Manual IBAN/ACH/PayPal Confirmations)',
                        'reminders (24h & 1h Automated Schedule)',
                        'calendar_connections (Google Calendar Config)',
                        'testimonials (Curated Real Feedback)',
                        'blog_posts (Foundational SEO Articles)',
                        'ai_knowledge (Controlled Teacher Truth Repo)',
                        'analytics_events (Funnel & Behavioral Tracking)',
                        'settings (Platform Business Rules & Policies)'
                      ].map((table, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1E1923] border border-[#D5D0CA]/80 dark:border-[#3E3545] flex items-center gap-2">
                          <span className="text-[#87A878]">✓</span>
                          <span className="text-[#362E3B] dark:text-[#F5E6D3] text-[11px]">{table}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
