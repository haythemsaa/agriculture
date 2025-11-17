export interface ValidationRule {
  required?: boolean
  email?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  phone?: boolean
  custom?: (value: any) => boolean | string
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export const useFormValidation = () => {
  const errors = ref<Record<string, string>>({})

  const validateField = (name: string, value: any, rules: ValidationRule): string => {
    // Required
    if (rules.required && (!value || value === '')) {
      return 'Ce champ est obligatoire'
    }

    // Skip other validations if empty and not required
    if (!value || value === '') {
      return ''
    }

    // Email
    if (rules.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        return 'Email invalide'
      }
    }

    // Phone (Tunisian format)
    if (rules.phone) {
      const phonePattern = /^(\+216)?[2-9]\d{7}$/
      if (!phonePattern.test(value.replace(/\s/g, ''))) {
        return 'Numéro de téléphone invalide'
      }
    }

    // Min value
    if (rules.min !== undefined && Number(value) < rules.min) {
      return `La valeur minimum est ${rules.min}`
    }

    // Max value
    if (rules.max !== undefined && Number(value) > rules.max) {
      return `La valeur maximum est ${rules.max}`
    }

    // Min length
    if (rules.minLength !== undefined && String(value).length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères requis`
    }

    // Max length
    if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères autorisés`
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(String(value))) {
      return 'Format invalide'
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value)
      if (result !== true) {
        return typeof result === 'string' ? result : 'Validation échouée'
      }
    }

    return ''
  }

  const validate = (formData: Record<string, any>, rules: ValidationRules): boolean => {
    errors.value = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = validateField(field, formData[field], fieldRules)
      if (error) {
        errors.value[field] = error
        isValid = false
      }
    }

    return isValid
  }

  const validateSingle = (field: string, value: any, rules: ValidationRule): boolean => {
    const error = validateField(field, value, rules)
    if (error) {
      errors.value[field] = error
      return false
    } else {
      delete errors.value[field]
      return true
    }
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearError = (field: string) => {
    delete errors.value[field]
  }

  const hasError = (field: string): boolean => {
    return !!errors.value[field]
  }

  const getError = (field: string): string => {
    return errors.value[field] || ''
  }

  return {
    errors: readonly(errors),
    validate,
    validateSingle,
    clearErrors,
    clearError,
    hasError,
    getError,
  }
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+216)?[2-9]\d{7}$/,
  postalCode: /^\d{4}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alpha: /^[a-zA-ZÀ-ÿ\s]+$/,
  numeric: /^\d+$/,
  url: /^https?:\/\/.+/,
}
