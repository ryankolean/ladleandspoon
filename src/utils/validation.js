import { supabase } from '@/lib/supabase';

export const validateEmail = (email) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors };
  }

  if (trimmedEmail.length > 254) {
    errors.push('Email is too long');
    return { isValid: false, errors };
  }

  const localPart = trimmedEmail.split('@')[0];
  if (localPart.length > 64) {
    errors.push('Email local part is too long');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitized: trimmedEmail };
};

export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase.rpc('check_email_exists', {
      check_email: email
    });

    if (error) {
      console.error('Email check error:', error);
      return { exists: false, error: null };
    }

    return { exists: data, error: null };
  } catch (err) {
    console.error('Email check exception:', err);
    return { exists: false, error: err };
  }
};

export const validateFullName = (name) => {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Full name is required');
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.push('Name must be at least 2 characters');
    return { isValid: false, errors };
  }

  if (trimmedName.length > 100) {
    errors.push('Name is too long');
    return { isValid: false, errors };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
    return { isValid: false, errors };
  }

  const sanitized = trimmedName.replace(/\s+/g, ' ');

  return { isValid: true, errors: [], sanitized };
};

export const validatePassword = (password) => {
  const errors = [];
  const requirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, requirements, strength: 'weak' };
  }

  if (password.length >= 8) {
    requirements.minLength = true;
  } else {
    errors.push('Password must be at least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    requirements.hasUpperCase = true;
  }

  if (/[a-z]/.test(password)) {
    requirements.hasLowerCase = true;
  }

  if (/[0-9]/.test(password)) {
    requirements.hasNumber = true;
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    requirements.hasSpecialChar = true;
  }

  let strength = 'weak';
  const metRequirements = Object.values(requirements).filter(Boolean).length;

  if (password.length >= 8) {
    if (metRequirements >= 4) {
      strength = 'strong';
    } else if (metRequirements >= 3) {
      strength = 'medium';
    }
  }

  if (password.length < 8) {
    return { isValid: false, errors, requirements, strength };
  }

  if (metRequirements < 3) {
    if (!requirements.hasUpperCase) errors.push('Add uppercase letters for stronger password');
    if (!requirements.hasLowerCase) errors.push('Add lowercase letters for stronger password');
    if (!requirements.hasNumber) errors.push('Add numbers for stronger password');
    if (!requirements.hasSpecialChar) errors.push('Add special characters for stronger password');
  }

  const isValid = password.length >= 8 && metRequirements >= 3;

  return {
    isValid,
    errors: isValid ? [] : errors,
    requirements,
    strength,
    warnings: isValid && metRequirements < 5 ? errors : []
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '')
    .trim();
};

export const validateForm = async (formData, isSignUp = false) => {
  const validationResults = {
    isValid: true,
    errors: {},
    warnings: {}
  };

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.email = emailValidation.errors[0];
  } else if (isSignUp) {
    const emailCheck = await checkEmailExists(emailValidation.sanitized);
    if (emailCheck.exists) {
      validationResults.isValid = false;
      validationResults.errors.email = 'This email is already registered. Please sign in instead.';
    }
  }

  if (isSignUp) {
    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      validationResults.isValid = false;
      validationResults.errors.fullName = nameValidation.errors[0];
    }
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.password = passwordValidation.errors[0];
  } else if (passwordValidation.warnings && passwordValidation.warnings.length > 0) {
    validationResults.warnings.password = passwordValidation.warnings[0];
  }

  return validationResults;
};
