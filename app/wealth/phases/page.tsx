"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const surface = "wealth-surface text-[var(--gaia-text-default)]";

export default function PhasesPage() {
  const [expandedPhases, setExpandedPhases] = useState<boolean[]>(
    new Array(11).fill(false),
  );

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) =>
      prev.map((expanded, i) => (i === index ? !expanded : expanded)),
    );
  };

  return (
    <main className={`relative min-h-screen ${surface} gaia-bg`}>
      <section className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Wealth Phases</h1>
          <p className="text-gray-300 text-lg">
            The structured progression through financial and personal
            development phases.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(0)}
            >
              {expandedPhases[0] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 1 — PLAN J
            </h2>
            {expandedPhases[0] && (
              <>
                <p className="text-gray-300 mb-2">
                  (Current reality / Suffocating level)
                </p>
                <p className="text-gray-300 mb-4">
                  Financial reality (ONLY focus)
                </p>

                <h3 className="text-lg font-medium text-white mb-2">Revenue</h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Required independent monthly revenue: 1,000</li>
                  <li>Source: non-salary (any lawful source)</li>
                  <li>Nature: recurring / repeatable</li>
                  <li>Usage rule: 0% spendable, 100% locked</li>
                  <li>
                    Purpose: Proof of survivability outside salary,
                    Psychological safety, not lifestyle
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">Savings</h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Required locked savings: 50,000</li>
                  <li>Source: Salary only, No borrowing, No revenue usage</li>
                  <li>Status: Frozen, Not emergency money, Not spendable</li>
                  <li>
                    Purpose: Investment seed, Insulation against panic,
                    Survivability
                  </li>
                </ul>

                <p className="text-gray-300 mb-4">
                  Entirely dependent on salary
                  <br />
                  Lifestyle remains constrained
                  <br />
                  No upgrades
                  <br />
                  No self-reward from revenue
                </p>

                <h3 className="text-lg font-medium text-white mb-2">
                  What is deliberately NOT active
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>No calendars</li>
                  <li>No habits</li>
                  <li>No projects</li>
                  <li>No medical actions</li>
                  <li>No receipt fixing</li>
                  <li>No identity rebuilding</li>
                </ul>

                <p className="text-green-400 font-medium">
                  Phase 1 ends ONLY when: Monthly revenue = 1,000, Locked
                  savings = 50,000
                </p>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(1)}
            >
              {expandedPhases[1] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 2 — PLAN J (completed financially) + PLAN I (financial only)
            </h2>
            {expandedPhases[1] && (
              <>
                <p className="text-gray-300 mb-4">
                  Continuing obligations from Plan J<br />
                  Revenue remains non-spendable
                  <br />
                  Savings remain locked
                  <br />
                  Salary still funds life
                  <br />
                  No lifestyle expansion
                </p>

                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN I — Receipts exposure (financial preparation ONLY)
                </h3>
                <h4 className="text-md font-medium text-white mb-2">
                  Savings for receipts
                </h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Amount: not defined yet by design</li>
                  <li>
                    Reason: Actual exposure not fully known, You will not guess
                    or panic-save
                  </li>
                  <li>
                    Method: Separate mental bucket, Slow accumulation from
                    salary
                  </li>
                  <li>
                    Usage: Future penalties, Corrections, Compliance costs
                  </li>
                  <li>
                    Rules: No authorities contacted yet, No documents submitted,
                    No fear-driven action
                  </li>
                </ul>

                <p className="text-green-400 font-medium">
                  Phase 2 ends when: Receipts fund exists, Plan J rules still
                  intact
                </p>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(2)}
            >
              {expandedPhases[2] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 3 — PLAN I (active work) + PLAN H (financial only)
            </h2>
            {expandedPhases[2] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN I — Receipts (ACTIVE)
                </h3>
                <h4 className="text-md font-medium text-white mb-2">Work</h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Gather all receipts</li>
                  <li>Categorize: Valid, Missing, Risky</li>
                  <li>Understand exposure</li>
                  <li>Decide strategy calmly</li>
                </ul>

                <h4 className="text-md font-medium text-white mb-2">
                  Spending
                </h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Allowed ONLY if mandatory</li>
                  <li>Paid from receipts fund</li>
                  <li>No borrowing from other buckets</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN H — Varicose vein treatment (financial preparation)
                </h3>
                <h4 className="text-md font-medium text-white mb-2">Savings</h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Amount: not defined yet</li>
                  <li>
                    Reason: Treatment path not chosen, Costs vary by method
                  </li>
                  <li>Purpose: Diagnosis, Treatment, Recovery buffer</li>
                  <li>
                    Rules: No shortcuts, Health &gt; speed, No shame spending
                  </li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(3)}
            >
              {expandedPhases[3] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 4 — PLAN H (active) + PLAN G (financial only)
            </h2>
            {expandedPhases[3] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN H — Medical (ACTIVE)
                </h3>
                <h4 className="text-md font-medium text-white mb-2">Actions</h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Doctor consultation</li>
                  <li>Diagnosis confirmation</li>
                  <li>Treatment selection</li>
                  <li>Procedure</li>
                  <li>Recovery period</li>
                </ul>

                <h4 className="text-md font-medium text-white mb-2">
                  Spending
                </h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Fully allowed</li>
                  <li>No guilt</li>
                  <li>No delay once scheduled</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN G — Life expansion preparation
                </h3>
                <h4 className="text-md font-medium text-white mb-2">Savings</h4>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Amount: not defined</li>
                  <li>Purpose: Future freedom, Reduced fear of consequences</li>
                  <li>Rule: Money accumulates quietly, No commitments yet</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(4)}
            >
              {expandedPhases[4] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 5 — PLAN G (active definition) + PLAN F (financial only)
            </h2>
            {expandedPhases[4] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN G — Expansion (ACTIVE)
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Define what expansion means</li>
                  <li>Only after: Health stabilized, Receipts resolved</li>
                  <li>No ego decisions</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN F — Next stage savings
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Savings amount: not defined</li>
                  <li>Built on top of all previous rules</li>
                  <li>Survival still conservative</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(5)}
            >
              {expandedPhases[5] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 6 — PLAN F (active) + PLAN E (financial only)
            </h2>
            {expandedPhases[5] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN F — Execution
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>
                    Carry forward: All calendars unlocked so far, All habits
                    achieved so far
                  </li>
                  <li>No regression allowed</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN E — Preparation
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Savings begin</li>
                  <li>No lifestyle jump</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(6)}
            >
              {expandedPhases[6] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 7 — PLAN E (active) + PLAN D (financial only)
            </h2>
            {expandedPhases[6] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN E — Stability deepening
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Identity less fragile</li>
                  <li>Slightly higher tolerance for consequences</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(7)}
            >
              {expandedPhases[7] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 8 — PLAN D (active) + PLAN C (financial only)
            </h2>
            {expandedPhases[7] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN D — Larger decisions
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Still rule-based</li>
                  <li>Still disciplined</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(8)}
            >
              {expandedPhases[8] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 9 — PLAN C (active) + PLAN B (financial only)
            </h2>
            {expandedPhases[8] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN C — Long-term positioning
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Reduced overthinking</li>
                  <li>Systems mostly automatic</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(9)}
            >
              {expandedPhases[9] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 10 — PLAN B (active) + PLAN A (financial only)
            </h2>
            {expandedPhases[9] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">
                  PLAN B — Final preparation
                </h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>No urgency</li>
                  <li>No fear-based moves</li>
                </ul>
              </>
            )}
          </div>

          <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800">
            <h2
              className="text-xl font-semibold text-white mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => togglePhase(10)}
            >
              {expandedPhases[10] ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              PHASE 11 — PLAN A (FINAL STATE)
            </h2>
            {expandedPhases[10] && (
              <>
                <h3 className="text-lg font-medium text-white mb-2">Reality</h3>
                <ul className="text-gray-300 space-y-1 mb-4">
                  <li>Money is insulation</li>
                  <li>Habits are embodied</li>
                  <li>Calendars are natural</li>
                  <li>No survival anxiety</li>
                  <li>No deferred repairs</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
