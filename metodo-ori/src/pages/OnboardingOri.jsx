import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import OnboardingShell from "../components/onboarding/OnboardingShell";
import { onboardingSteps } from "../data/onboardingOriSteps";
import { supabase } from "../lib/supabaseClient";

const ONBOARDING_COMPLETED_KEY = "ori_onboarding_completed";
const ONBOARDING_DATA_KEY = "ori_onboarding_data";

const getOnboardingCompletedKey = (user) => {
  const userKey = user?.id || user?.email;
  return userKey
    ? `${ONBOARDING_COMPLETED_KEY}:${userKey}`
    : ONBOARDING_COMPLETED_KEY;
};

const getOnboardingDataKey = (user) => {
  const userKey = user?.id || user?.email;
  return userKey ? `${ONBOARDING_DATA_KEY}:${userKey}` : ONBOARDING_DATA_KEY;
};

const getSavedOnboardingData = (user) => {
  try {
    const savedData = localStorage.getItem(getOnboardingDataKey(user));
    return savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.log("Não consegui recuperar a leitura de entrada:", error);
    return {};
  }
};

const saveOnboardingData = (data, user) => {
  localStorage.setItem(getOnboardingDataKey(user), JSON.stringify(data));
};

const getFirstName = (name) => {
  const cleanName = String(name || "").trim();
  return cleanName ? cleanName.split(/\s+/)[0] : "";
};

const getAuthName = (user) =>
  user?.user_metadata?.nome ||
  user?.user_metadata?.name ||
  user?.user_metadata?.full_name ||
  user?.user_metadata?.fullName ||
  "";

const mergeKnownIdentity = (currentData, knownData) => {
  const fullName = currentData.fullName || knownData.fullName || "";
  const preferredName =
    currentData.preferredName ||
    knownData.preferredName ||
    getFirstName(fullName);

  return {
    ...currentData,
    email: currentData.email || knownData.email || "",
    fullName,
    preferredName,
  };
};

const normalizeOnboardingProfile = (data) => ({
  fullName: data.fullName || "",
  preferredName: data.preferredName || "",
  birthDate: data.birthDate || "",
  residenceLocation: data.residenceLocation || "",
  whatsapp: data.whatsapp || "",
  email: data.email || "",
  journeyStage: data.journeyStage || "",
  mainPain: data.mainPain || "",
  mainPainCustom: data.mainPainCustom || "",
  mainDesire: data.mainDesire || "",
  racialIdentity: data.racialIdentity || "",
  completedAt: data.completedAt || new Date().toISOString(),
});

const parseStoredProfile = (profile) => {
  if (!profile) return {};
  if (typeof profile !== "string") return profile;

  try {
    return JSON.parse(profile);
  } catch (error) {
    console.log("Não consegui interpretar o perfil salvo:", error);
    return {};
  }
};

function OnboardingOri() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadKnownIdentity() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.log("Não consegui reconhecer a sessão da entrada:", sessionError);
      }

      const user = sessionData?.session?.user;
      if (!user) return;

      if (isMounted) {
        setAuthUser(user);
      }

      localStorage.removeItem(ONBOARDING_DATA_KEY);
      const savedUserData = getSavedOnboardingData(user);

      const authName = getAuthName(user);
      const knownData = {
        email: user.email || "",
        fullName: authName,
        preferredName: getFirstName(authName),
      };

      const { data: profileData, error: profileError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.log("Não consegui carregar o perfil da entrada:", profileError);
      }

      const enrichedKnownData = {
        ...knownData,
        email: profileData?.email || knownData.email,
        fullName: profileData?.nome || knownData.fullName,
        preferredName: getFirstName(profileData?.nome || knownData.fullName),
      };

      const storedProfile = parseStoredProfile(profileData?.perfil_onboarding);

      if (!isMounted) return;

      setFormData((currentData) => {
        const nextData = mergeKnownIdentity(
          {
            ...currentData,
            ...savedUserData,
            ...storedProfile,
          },
          enrichedKnownData,
        );
        saveOnboardingData(nextData, user);
        return nextData;
      });
    }

    loadKnownIdentity();

    return () => {
      isMounted = false;
    };
  }, []);

  const step = onboardingSteps[stepIndex];
  const totalSteps = onboardingSteps.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const canProceed = useMemo(() => {
    if (!step?.fields?.length) return true;

    return step.fields.every((field) => {
      if (field.showWhen) {
        const dependentValue = formData[field.showWhen.field];
        if (dependentValue !== field.showWhen.equals) return true;
      }

      if (!field.required) return true;

      const value = formData[field.name];

      if (Array.isArray(value)) return value.length > 0;

      return Boolean(String(value || "").trim());
    });
  }, [formData, step]);

  const updateFormData = (nextData) => {
    setFormData(nextData);
    saveOnboardingData(nextData, authUser);
  };

  const handleFieldChange = (name, value) => {
    const nextData = {
      ...formData,
      [name]: value,
    };

    if (
      name === "mainPain" &&
      value !== "Quero escrever com minhas palavras"
    ) {
      nextData.mainPainCustom = "";
    }

    updateFormData(nextData);
  };

  const handleCheckboxChange = (name, option, maxSelections) => {
    const currentValues = Array.isArray(formData[name]) ? formData[name] : [];
    const optionIsSelected = currentValues.includes(option);

    const nextValues = optionIsSelected
      ? currentValues.filter((value) => value !== option)
      : [...currentValues, option].slice(0, maxSelections);

    updateFormData({
      ...formData,
      [name]: nextValues,
    });
  };

  const handleBack = () => {
    setStepIndex((currentStepIndex) => Math.max(currentStepIndex - 1, 0));
  };

  const handleNext = async () => {
    if (!canProceed) return;

    if (step.type === "success") {
      let user = authUser;

      if (!user) {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user || null;
      }

      const completedProfile = normalizeOnboardingProfile({
        ...formData,
        completedAt: new Date().toISOString(),
      });
      const profilePain =
        completedProfile.mainPain === "Quero escrever com minhas palavras"
          ? completedProfile.mainPainCustom || completedProfile.mainPain
          : completedProfile.mainPain || completedProfile.mainPainCustom || "";

      if (user?.id) {
        const { error: saveProfileError } = await supabase
          .from("clientes")
          .upsert(
            {
              user_id: user.id,
              email: user.email || completedProfile.email || null,
              nome: completedProfile.fullName || null,
              perfil_onboarding: completedProfile,
              perfil_onboarding_concluido: true,
              perfil_onboarding_concluido_em: completedProfile.completedAt,
              principal_dor: profilePain || null,
              objetivo_principal: completedProfile.mainDesire || null,
              momento_atual: completedProfile.journeyStage || null,
              status_jornada: "Perfil criado",
              produto_1_liberado: true,
            },
            {
              onConflict: "email",
            },
          );

        if (saveProfileError) {
          console.log("Não foi possível salvar o perfil ORI:", saveProfileError);
          alert(
            "Não consegui salvar seu perfil agora. Tente novamente em instantes.",
          );
          return;
        }
      }

      localStorage.setItem(getOnboardingCompletedKey(user), "true");
      saveOnboardingData(completedProfile, user);
      navigate("/portal", { replace: true });
      return;
    }

    setStepIndex((currentStepIndex) =>
      Math.min(currentStepIndex + 1, totalSteps - 1),
    );
  };

  return (
    <OnboardingShell
      step={step}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      progress={progress}
      formData={formData}
      canProceed={canProceed}
      onFieldChange={handleFieldChange}
      onCheckboxChange={handleCheckboxChange}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}

export default OnboardingOri;
