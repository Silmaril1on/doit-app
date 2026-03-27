const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const getPasswordStrength = (password) => {
  const value = password || "";

  if (!value) {
    return {
      score: 0,
      label: "",
      textClass: "text-white/60",
      barClass: "bg-white/20",
      hint: "Use 8+ characters for a stronger password.",
    };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) {
    return {
      score,
      label: "WEAK",
      textClass: "text-red-400",
      barClass: "bg-red-500",
      hint: "Add more length and mix letters, numbers, or symbols.",
    };
  }

  if (score <= 3) {
    return {
      score,
      label: "MEDIUM",
      textClass: "text-amber-300",
      barClass: "bg-amber-400",
      hint: "Good start. Add one more character type for stronger security.",
    };
  }

  return {
    score,
    label: "STRONG",
    textClass: "text-emerald-300",
    barClass: "bg-emerald-400",
    hint: "Strong password. Nice work.",
  };
};

export const validateRegistrationForm = (form) => {
  const username = (form?.username || "").trim();
  const email = (form?.email || "").trim().toLowerCase();
  const password = form?.password || "";
  const confirmPassword = form?.confirmPassword || "";

  if (!username || !email || !password || !confirmPassword) {
    return {
      isValid: false,
      errorMessage: "Please fill in all required fields.",
      cleanedData: null,
    };
  }

  if (username.length < 3 || username.length > 24) {
    return {
      isValid: false,
      errorMessage: "Username must be between 3 and 24 characters.",
      cleanedData: null,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      errorMessage:
        "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      cleanedData: null,
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid email address.",
      cleanedData: null,
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      errorMessage: "Password must be at least 6 characters long.",
      cleanedData: null,
    };
  }

  if (password.length > 72) {
    return {
      isValid: false,
      errorMessage: "Password is too long. Please keep it under 72 characters.",
      cleanedData: null,
    };
  }

  if (/\s/.test(password)) {
    return {
      isValid: false,
      errorMessage: "Password cannot contain spaces.",
      cleanedData: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      errorMessage: "Passwords do not match.",
      cleanedData: null,
    };
  }

  return {
    isValid: true,
    errorMessage: "",
    cleanedData: {
      username,
      email,
      password,
    },
  };
};
