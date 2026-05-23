import OnboardingLeftPanel from "./OnboardingLeftPanel";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingQuestionStep from "./OnboardingQuestionStep";
import OnboardingNavigation from "./OnboardingNavigation";

export default function OnboardingShell({
  step,
  stepIndex,
  totalSteps,
  progress,
  formData,
  onFieldChange,
  onCheckboxChange,
  canProceed,
  onNext,
  onBack,
}) {
  const portalIntensity = Math.max(0.12, progress / 100);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#050202] text-[#f7ead8] md:h-screen">
      <style>{`
        @keyframes oriOnboardingBreath {
          0%, 100% { opacity: 0.36; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.58; transform: translate3d(0, -10px, 0) scale(1.035); }
        }

        @keyframes oriOnboardingOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes oriOnboardingScan {
          0% { transform: translateY(-110%); opacity: 0; }
          18% { opacity: 0.14; }
          50% { opacity: 0.09; }
          100% { transform: translateY(110%); opacity: 0; }
        }

        @keyframes oriParticleRise {
          0%, 100% { transform: translate3d(0, 8px, 0); opacity: 0.14; }
          50% { transform: translate3d(0, -8px, 0); opacity: 0.34; }
        }
      `}</style>

      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        src="/videos/quizz/quizz-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 48% 45%, rgba(242,185,104,0.12), transparent 22%), radial-gradient(circle at 68% 18%, rgba(210,135,70,0.10), transparent 24%), radial-gradient(circle at 18% 78%, rgba(140,111,145,0.08), transparent 26%), linear-gradient(135deg, rgba(5,2,2,0.82), rgba(16,7,8,0.76) 46%, rgba(5,2,2,0.92))",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(242,185,104,0.055)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] rounded-full border border-[rgba(210,135,70,0.07)]"
        style={{ animation: "oriOnboardingOrbit 42s linear infinite" }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] rounded-full border border-[rgba(242,185,104,0.09)]"
        style={{ animation: "oriOnboardingBreath 7s ease-in-out infinite" }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_center,rgba(255,245,235,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div
        className="pointer-events-none absolute left-[58%] top-[18%] h-1 w-1 rounded-full bg-[#f2b968]"
        style={{
          opacity: 0.16 + portalIntensity * 0.2,
          boxShadow: "0 0 18px rgba(242,185,104,0.46)",
          animation: "oriParticleRise 5.2s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute left-[84%] top-[62%] h-1 w-1 rounded-full bg-[#d28746]"
        style={{
          opacity: 0.12 + portalIntensity * 0.18,
          boxShadow: "0 0 16px rgba(210,135,70,0.42)",
          animation: "oriParticleRise 6.6s ease-in-out infinite 1.4s",
        }}
      />
      <div
        className="pointer-events-none absolute left-[42%] top-[76%] h-1 w-1 rounded-full bg-[#f2b968]"
        style={{
          opacity: 0.1 + portalIntensity * 0.16,
          boxShadow: "0 0 16px rgba(242,185,104,0.36)",
          animation: "oriParticleRise 7.4s ease-in-out infinite 0.8s",
        }}
      />

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center overflow-hidden px-3 py-3 md:h-screen md:px-6 md:py-4">
        <div
          className="relative grid h-[calc(100svh-24px)] max-h-[760px] min-h-[620px] w-full max-w-[1180px] overflow-hidden rounded-[24px] border md:h-[calc(100vh-32px)] md:min-h-0 md:rounded-[30px] lg:grid-cols-[0.48fr_0.52fr]"
          style={{
            borderColor: "rgba(242,185,104,0.18)",
            background:
              "linear-gradient(135deg, rgba(18,8,9,0.86), rgba(5,2,2,0.94))",
            boxShadow:
              "0 36px 120px rgba(0,0,0,0.62), 0 0 90px rgba(242,185,104,0.055), inset 0 1px 0 rgba(255,245,235,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <OnboardingLeftPanel stepIndex={stepIndex} formData={formData} />

          <div className="pointer-events-none absolute bottom-8 left-[48%] top-8 hidden w-px lg:block">
            <div className="h-full w-px bg-gradient-to-b from-transparent via-[rgba(242,185,104,0.28)] to-transparent" />
            <div
              className="absolute inset-x-[-2px] top-0 h-1/2 bg-gradient-to-b from-transparent via-[rgba(242,185,104,0.34)] to-transparent blur-[3px]"
              style={{ animation: "oriOnboardingScan 6s ease-in-out infinite" }}
            />
          </div>

          <section
            className="relative flex h-full min-h-0 flex-col overflow-hidden px-4 py-4 md:px-10 md:py-6 lg:px-12"
            style={{
              background:
                `radial-gradient(circle at 92% 52%, rgba(242,185,104,${0.06 + portalIntensity * 0.08}), transparent 27%), radial-gradient(circle at 82% 52%, rgba(210,135,70,${0.03 + portalIntensity * 0.05}), transparent 18%), linear-gradient(145deg, rgba(13,6,7,0.90), rgba(5,2,2,0.96))`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-44 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border"
              style={{
                borderColor: `rgba(242,185,104,${0.05 + portalIntensity * 0.07})`,
                boxShadow: `0 0 ${24 + portalIntensity * 44}px rgba(242,185,104,${0.02 + portalIntensity * 0.035})`,
              }}
            />
            <div
              className="pointer-events-none absolute -right-32 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border"
              style={{
                borderColor: `rgba(210,135,70,${0.06 + portalIntensity * 0.08})`,
              }}
            />
            <div
              className="pointer-events-none absolute -right-20 top-1/2 h-[210px] w-[210px] -translate-y-1/2 rounded-full border"
              style={{
                borderColor: `rgba(242,185,104,${0.05 + portalIntensity * 0.1})`,
                opacity: 0.55 + portalIntensity * 0.28,
              }}
            />
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(242,185,104,0.32)] to-transparent" />

            <OnboardingProgress
              step={step}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              progress={progress}
            />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="ori-premium-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="flex min-h-full items-center py-1 md:py-2">
                  <div
                    key={step.id}
                    className="relative mx-auto w-full max-w-[540px] animate-[fadeUp_0.42s_cubic-bezier(0.16,1,0.3,1)_both] overflow-hidden rounded-[22px] border px-4 py-4 md:rounded-[26px] md:px-7 md:py-6"
                    style={{
                      borderColor: "rgba(242,185,104,0.16)",
                      background:
                        "radial-gradient(circle at 82% 14%, rgba(242,185,104,0.060), transparent 30%), linear-gradient(145deg, rgba(23,10,9,0.70), rgba(8,3,4,0.82) 62%, rgba(20,8,7,0.66))",
                      boxShadow:
                        "0 22px 70px rgba(0,0,0,0.34), 0 0 48px rgba(242,185,104,0.038), inset 0 1px 0 rgba(255,245,235,0.060), inset 0 0 38px rgba(242,185,104,0.020)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(242,185,104,0.28)] to-transparent" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(242,185,104,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(242,185,104,0.16)_1px,transparent_1px)] [background-size:42px_42px]" />
                    <OnboardingQuestionStep
                      step={step}
                      formData={formData}
                      onFieldChange={onFieldChange}
                      onCheckboxChange={onCheckboxChange}
                    />

                    <OnboardingNavigation
                      step={step}
                      stepIndex={stepIndex}
                      totalSteps={totalSteps}
                      canProceed={canProceed}
                      onBack={onBack}
                      onNext={onNext}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
