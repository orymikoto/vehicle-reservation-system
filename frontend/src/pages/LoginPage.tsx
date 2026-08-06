import React, { useState } from "react";
import api from "../services/api";
import { User } from "../types";
import { Modal } from "../components/Modal";
import {
    ShieldCheck,
    UserCheck,
    AlertCircle,
    Building2,
    Briefcase,
    ExternalLink,
    Code,
    CheckCircle2,
} from "lucide-react";

interface LoginPageProps {
    onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("admin@minefleet.com");
    const [password, setPassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", { email, password });
            const { user, token } = res.data.data;
            onLoginSuccess(user, token);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Invalid credentials or login failure.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSelect = (quickEmail: string) => {
        setEmail(quickEmail);
        setPassword("password");
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4 relative">
            {/* Top Banner Button for Recruiters */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={() => setIsRecruiterModalOpen(true)}
                    className="flex items-center gap-2 text-xl px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#146C43]  font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                    <Briefcase className="w-4 h-4" />
                    For Recruiter
                </button>
            </div>

            <div className="w-full max-w-md bg-white border border-[#E6E6E2] rounded-xl p-8 shadow-xs">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#146C43] text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-xs">
                        M
                    </div>
                    <h2 className="text-2xl font-bold text-[#18181B]">
                        MineFleet Portal
                    </h2>
                    <p className="text-sm text-[#6B7280]">
                        Multi-Location Mining Fleet System
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43] transition-colors"
                            placeholder="user@minefleet.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43] transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-2 flex items-center justify-center"
                    >
                        {loading ? "Authenticating..." : "Sign In to MineFleet"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#ECECE8]">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3 text-center">
                        Demo Account Credentials
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() =>
                                handleQuickSelect("admin@minefleet.com")
                            }
                            className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
                        >
                            <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                                <ShieldCheck className="w-3 h-3 text-[#146C43]" />
                                Super Admin
                            </div>
                            <span className="text-[10px] text-[#6B7280] truncate">
                                admin@minefleet.com
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleQuickSelect("admin.loc-msa@minefleet.com")
                            }
                            className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
                        >
                            <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                                <Building2 className="w-3 h-3 text-[#146C43]" />
                                Site Admin
                            </div>
                            <span className="text-[10px] text-[#6B7280] truncate">
                                admin.loc-msa@minefleet.com
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleQuickSelect("approver1@minefleet.com")
                            }
                            className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
                        >
                            <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                                <UserCheck className="w-3 h-3 text-[#146C43]" />
                                Approver L1
                            </div>
                            <span className="text-[10px] text-[#6B7280] truncate">
                                approver1@minefleet.com
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsRecruiterModalOpen(true)}
                        className="text-xs font-semibold text-[#146C43] hover:underline inline-flex items-center gap-1"
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        Recruiter Information & Project Context
                    </button>
                </div>
            </div>

            {/* Recruiter Information Modal */}
            <Modal
                isOpen={isRecruiterModalOpen}
                onClose={() => setIsRecruiterModalOpen(false)}
                title="Recruitment Technical Test Overview"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4 text-sm text-[#18181B]">
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#146C43] space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Sekawan Media Recruitment Technical Test
                        </div>
                        <div>
                            Target Position: <strong>Project Lead</strong>
                        </div>
                        <div>
                            Location: <strong>Sekawan Media, Malang</strong>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-[#18181B]">
                            About MineFleet Application
                        </h4>
                        <p className="text-xs text-[#6B7280] leading-relaxed">
                            MineFleet is a production-quality enterprise Vehicle
                            Reservation System designed for a mining company
                            operating across 6 operational mine sites.
                        </p>
                        <ul className="text-xs text-[#6B7280] space-y-1 list-disc pl-4">
                            <li>
                                <strong>Architecture:</strong> Strict Clean
                                Architecture (Presentation, Application, Domain,
                                Infrastructure).
                            </li>
                            <li>
                                <strong>Backend:</strong> Laravel 12, PHP 8.3+,
                                Sanctum, MySQL / PostgreSQL 16.
                            </li>
                            <li>
                                <strong>Frontend:</strong> React, TypeScript,
                                Vite, Vanilla CSS & TailwindCSS.
                            </li>
                            <li>
                                <strong>Features:</strong> 2-Level Approval
                                Flow, Inter-site Transfers, Fuel & Maintenance
                                Expense Analytics, Searchable Selects, Audit
                                Activity Logging.
                            </li>
                        </ul>
                    </div>

                    <div className="pt-3 border-t border-[#ECECE8]">
                        <span className="text-xs font-semibold uppercase text-[#6B7280] block mb-2">
                            GitHub Repository
                        </span>
                        <a
                            href="https://github.com/orymikoto/vehicle-reservation-system"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 p-3 rounded-lg border border-[#E6E6E2] bg-[#FAFAF8] text-xs font-bold text-[#146C43] hover:border-[#146C43] hover:bg-emerald-50 transition-colors w-full justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-[#18181B]" />
                                github.com/orymikoto/vehicle-reservation-system
                            </span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="flex justify-end border-t border-[#ECECE8] pt-4">
                        <button
                            type="button"
                            onClick={() => setIsRecruiterModalOpen(false)}
                            className="btn-primary"
                        >
                            Close Overview
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
