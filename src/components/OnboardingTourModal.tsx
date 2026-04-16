import React from 'react';
import { ArrowRight, Check, Info, Search, Zap, X } from 'lucide-react';

type TourStep = 0 | 1 | 2;

export default function OnboardingTourModal({
  step,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: {
  step: TourStep;
  totalSteps: number;
  onNext: () => void;
  onBack?: (() => void) | undefined;
  onSkip: () => void;
}) {
  const stepLabel = step === 0 ? 'About' : step === 1 ? 'Automation rules' : 'Hiring automation';

  return (
    <div className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-black/[0.06]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-black/50 mb-2">
                <span className="p-2 rounded-xl bg-black/[0.04]">
                  {step === 0 ? <Info className="w-4 h-4 text-black/60" /> : step === 1 ? <Zap className="w-4 h-4 text-amber-600" /> : <Search className="w-4 h-4 text-blue-600" />}
                </span>
                <span>
                  Step {step + 1}/{totalSteps}: {stepLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
                {step === 0
                  ? 'Welcome to KarmaOS'
                  : step === 1
                    ? 'Automation rules: build workflows from plain English'
                    : 'Hiring automation: source, scrape, and triage candidates'}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-black/60 leading-relaxed">
                {step === 0
                  ? 'In this quick tour, you’ll set up Automation rules and Hiring automation so KarmaOS can turn your hiring + HR intent into actions.'
                  : step === 1
                    ? 'Create a rule, see the visual pipeline, then run it to evaluate what employees match your conditions.'
                    : 'Write a sourcing rule, run scraping to find matches from LinkedIn and Naukri, then review candidates in one place.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onSkip}
              className="p-2 rounded-full text-black/40 hover:text-black hover:bg-black/[0.05] transition-colors"
              aria-label="Skip tour"
              title="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-black/[0.03] rounded-2xl border border-black/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-black/70">
                      KarmaOS connects recruiting, HR operations, and workforce intelligence. You express intent in natural language, and it builds visual workflows you can evaluate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-black/60">
                Next you’ll learn where to create:
                <span className="font-medium text-black/80"> Automation rules</span> and{" "}
                <span className="font-medium text-black/80">Hiring automation</span>.
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-black/[0.03] rounded-2xl border border-black/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-black/70">
                      1) Create a rule: open <span className="font-semibold">New Automation</span>, type a plain-English prompt, then click <span className="font-semibold">Create Rule</span>.
                    </p>
                    <p className="text-sm text-black/70 mt-2">
                      2) Run it: pick your rule in <span className="font-semibold">All Automations</span>, then click <span className="font-semibold">Run Pipeline</span>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-black/60">
                You’ll see which employees match your conditions, and what actions KarmaOS would deliver.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-black/[0.03] rounded-2xl border border-black/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-black/70">
                      1) Create a sourcing rule: click <span className="font-semibold">New Rule</span> and describe your ideal hire in plain English.
                    </p>
                    <p className="text-sm text-black/70 mt-2">
                      2) Scrape now: in the rule card, click <span className="font-semibold">Scrape Now</span>.
                    </p>
                    <p className="text-sm text-black/70 mt-2">
                      3) Review candidates: open the <span className="font-semibold">Candidates</span> tab and shortlist/reject.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-black/60">
                When you’re ready, finish this tour and start building your first end-to-end hiring flow.
              </div>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-black/[0.06] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-black/50 hover:text-black transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-full border border-black/[0.08] text-sm font-medium text-black/60 hover:text-black hover:bg-black/[0.03] transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
            >
              {step === 0 ? 'Go to Automation' : step === 1 ? 'Go to Hiring automation' : 'Finish tour'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

