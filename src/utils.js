import { AGE_CATEGORIES, GENDER_CATEGORIES } from "./constants";

export const validateCategories = (patientCategory) => {
  const hasGender = GENDER_CATEGORIES.some((genderCategory) => (patientCategory & genderCategory) === genderCategory);
  const hasAge = AGE_CATEGORIES.some((ageCategory) => (patientCategory & ageCategory) === ageCategory);

  return hasGender && hasAge;
};
