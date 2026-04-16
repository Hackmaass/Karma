import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingTourModal from '../components/OnboardingTourModal';

type TourStep = 0 | 1 | 2;

export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const storageKeys = useMemo(() => {
    if (!currentUser) return null;
    return {
      completedKey: `karmaos_onboarding_v1_completed_${currentUser.uid}`,
      stepKey: `karmaos_onboarding_v1_step_${currentUser.uid}`,
    };
  }, [currentUser]);

  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState<TourStep>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!storageKeys) return;
    if (authLoading) return;

    const storedCompleted = window.localStorage.getItem(storageKeys.completedKey) === 'true';
    const rawStep = Number(window.localStorage.getItem(storageKeys.stepKey) ?? '0');
    const storedStep: TourStep = rawStep === 1 || rawStep === 2 ? rawStep : 0;

    setCompleted(storedCompleted);
    setStep(storedStep);
    setLoaded(true);
  }, [authLoading, storageKeys]);

  const setStepAndPersist = (nextStep: TourStep) => {
    setStep(nextStep);
    if (typeof window !== 'undefined' && storageKeys) {
      window.localStorage.setItem(storageKeys.stepKey, String(nextStep));
    }
  };

  const completeAndPersist = () => {
    setCompleted(true);
    if (typeof window !== 'undefined' && storageKeys) {
      window.localStorage.setItem(storageKeys.completedKey, 'true');
    }
  };

  const shouldShow =
    loaded &&
    !authLoading &&
    Boolean(currentUser) &&
    !completed &&
    location.pathname.startsWith('/app');

  const isStepRouteMatch =
    (step === 0 && location.pathname.startsWith('/app')) ||
    (step === 1 && location.pathname === '/app/automation') ||
    (step === 2 && location.pathname === '/app/hiring');

  const showModal = shouldShow && isStepRouteMatch;

  return (
    <>
      {children}
      {showModal && (
        <OnboardingTourModal
          step={step}
          totalSteps={3}
          onSkip={completeAndPersist}
          onNext={() => {
            if (step === 0) {
              setStepAndPersist(1);
              navigate('/app/automation');
            } else if (step === 1) {
              setStepAndPersist(2);
              navigate('/app/hiring');
            } else {
              completeAndPersist();
            }
          }}
          onBack={
            step === 0
              ? undefined
              : () => {
                  if (step === 2) {
                    setStepAndPersist(1);
                    navigate('/app/automation');
                  } else {
                    setStepAndPersist(0);
                    navigate('/app');
                  }
                }
          }
        />
      )}
    </>
  );
}

