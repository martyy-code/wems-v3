// WEMS Domain Constants
// These are fixed values used throughout the application

// Contract Types
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Alternance'] as const
export type ContractType = typeof CONTRACT_TYPES[number]
export const contractTypesList: ContractType[] = [...CONTRACT_TYPES]

// CACES Categories (R489)
export const CACES_CATEGORIES = ['1a', '1b', '2b', '3', '4', '5', '6', '7'] as const
export type CacesCategory = typeof CACES_CATEGORIES[number]
export const cacesCategoriesList: CacesCategory[] = [...CACES_CATEGORIES]

// Medical Visit Types
export const MEDICAL_VISIT_TYPES = ['Embauche', 'Périodique', 'Reprise', 'Spécifique'] as const
export type MedicalVisitType = typeof MEDICAL_VISIT_TYPES[number]
export const medicalVisitTypesList: MedicalVisitType[] = [...MEDICAL_VISIT_TYPES]

// Medical Visit Results
export const MEDICAL_VISIT_RESULTS = ['Apte', 'Apte avec restrictions', 'Inapte'] as const
export type MedicalVisitResult = typeof MEDICAL_VISIT_RESULTS[number]
export const medicalVisitResultsList: MedicalVisitResult[] = [...MEDICAL_VISIT_RESULTS]
