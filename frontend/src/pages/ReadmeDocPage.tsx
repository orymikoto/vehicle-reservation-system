import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, BookOpen, UserCheck, ShieldCheck, Building2, CheckCircle2, ExternalLink, Code } from 'lucide-react';

export const ReadmeDocPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'readme' | 'note'>('readme');
  const [readmeContent, setReadmeContent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const [readmeRes, noteRes] = await Promise.all([
        api.get('/docs/readme'),
        api.get('/docs/note'),
      ]);
      setReadmeContent(readmeRes.data.data.content);
      setNoteContent(noteRes.data.data.content);
    } catch (err) {
      console.error('Failed to load documentation files', err);
    } finally {
      setLoading(false);
    }
  };

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const tokens = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return <strong key={i} className="font-bold text-[#18181B]">{token.slice(2, -2)}</strong>;
      }
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#146C43] font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return token;
    });
  };

  const renderSimpleMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-bold text-[#18181B] mb-4 mt-6 border-b border-[#ECECE8] pb-2">
            {parseInlineMarkdown(line.replace('# ', ''))}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-[#146C43] mb-3 mt-6 flex items-center gap-2">
            {parseInlineMarkdown(line.replace('## ', ''))}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-[#18181B] mb-2 mt-4">
            {parseInlineMarkdown(line.replace('### ', ''))}
          </h3>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="p-3.5 bg-emerald-50 border-l-4 border-[#146C43] text-xs text-[#146C43] italic rounded-r-lg my-3 leading-relaxed">
            {parseInlineMarkdown(line.replace('> ', ''))}
          </blockquote>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 text-xs text-[#6B7280] my-1.5 list-disc leading-relaxed">
            {parseInlineMarkdown(line.replace('- ', ''))}
          </li>
        );
      }
      if (line.startsWith('```')) {
        return null;
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-6 border-[#ECECE8]" />;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-[#18181B] leading-relaxed my-1.5">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-[#146C43] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            Sekawan Media Technical Assessment Documentation
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Candidate: <strong>Mikli Oktarianto</strong> • Position: <strong>Project Lead</strong> • Sekawan Media, Malang
          </p>
        </div>

        <a
          href="https://github.com/orymikoto/vehicle-reservation-system"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#146C43] text-xs font-bold rounded-lg hover:bg-emerald-50 transition-colors shrink-0 shadow-2xs"
        >
          <Code className="w-4 h-4" />
          GitHub Repository
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Doc Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-[#ECECE8] pb-1">
        <button
          onClick={() => setActiveTab('readme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'readme'
              ? 'bg-[#146C43] text-white shadow-2xs'
              : 'bg-white border border-[#E6E6E2] text-[#6B7280] hover:text-[#18181B]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          README.md (Technical Specs & Setup)
        </button>

        <button
          onClick={() => setActiveTab('note')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'note'
              ? 'bg-[#146C43] text-white shadow-2xs'
              : 'bg-white border border-[#E6E6E2] text-[#6B7280] hover:text-[#18181B]'
          }`}
        >
          <FileText className="w-4 h-4" />
          NOTE.md (Recruiter Note & Engineering Philosophy)
        </button>
      </div>

      {/* Demo Quick Credentials Card */}
      <div className="p-4 bg-white border border-[#E6E6E2] rounded-xl shadow-2xs space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#146C43]" />
          Quick Demo Credentials Reference
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E6E6E2] text-xs">
            <div className="font-bold text-[#18181B] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#146C43]" /> Super Admin
            </div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">admin@minefleet.com</div>
            <div className="text-[10px] text-[#9CA3AF]">Pass: password</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E6E6E2] text-xs">
            <div className="font-bold text-[#18181B] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#146C43]" /> Site Admin (Site A)
            </div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">admin.loc-msa@minefleet.com</div>
            <div className="text-[10px] text-[#9CA3AF]">Pass: password</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E6E6E2] text-xs">
            <div className="font-bold text-[#18181B] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Approver L1 (Site A)
            </div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">approver1@minefleet.com</div>
            <div className="text-[10px] text-[#9CA3AF]">Pass: password</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E6E6E2] text-xs">
            <div className="font-bold text-[#18181B] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approver L2 (Site A)
            </div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">approver2@minefleet.com</div>
            <div className="text-[10px] text-[#9CA3AF]">Pass: password</div>
          </div>
        </div>
      </div>

      {/* Document View Content Container */}
      <div className="p-6 md:p-8 bg-white border border-[#E6E6E2] rounded-xl shadow-2xs min-h-[500px]">
        {loading ? (
          <div className="text-center py-12 text-[#6B7280] text-sm">
            Loading documentation content...
          </div>
        ) : (
          <div>
            {activeTab === 'readme' ? renderSimpleMarkdown(readmeContent) : renderSimpleMarkdown(noteContent)}
          </div>
        )}
      </div>
    </div>
  );
};
