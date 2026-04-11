export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const isValidMobile = (v: string) =>
  /^[6-9]\d{9}$/.test(v.trim());

export const isValidPinCode = (v: string) =>
  /^\d{6}$/.test(v.trim());

export const isValidIFSC = (v: string) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim());

export const isValidLatLng = (v: string) =>
  v.trim() !== "" && !isNaN(Number(v.trim()));

// ── Personal Details ──────────────────────────────────────────────────────────

export type PersonalFormState = {
  hospitalName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  email: string;
  mobile: string;
  altMobile: string;
  landline: string;
  aboutUs: string;
  latitude: string;
  longitude: string;
};

export function validatePersonalDetails(
  form: PersonalFormState,
  imageCount: number
): ValidationErrors<PersonalFormState & { images: string }> {
  const errors: Record<string, string> = {};

  if (!form.hospitalName.trim()) errors.hospitalName = "Hospital Name is required";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address Line 1 is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state.trim()) errors.state = "State is required";
  if (!form.pinCode.trim()) errors.pinCode = "PIN Code is required";
  else if (!isValidPinCode(form.pinCode)) errors.pinCode = "Enter a valid 6-digit PIN Code";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(form.email)) errors.email = "Enter a valid email address";
  if (!form.mobile.trim()) errors.mobile = "Mobile Number is required";
  else if (!isValidMobile(form.mobile)) errors.mobile = "Enter a valid 10-digit mobile number";
  if (!form.latitude.trim()) errors.latitude = "Latitude is required";
  else if (!isValidLatLng(form.latitude)) errors.latitude = "Enter a valid latitude";
  if (!form.longitude.trim()) errors.longitude = "Longitude is required";
  else if (!isValidLatLng(form.longitude)) errors.longitude = "Enter a valid longitude";
  if (!form.aboutUs.trim()) errors.aboutUs = "About Us is required";
  if (imageCount < 3) errors.images = "At least 3 images are required";

  return errors;
}

// ── Bank Details ──────────────────────────────────────────────────────────────

export type BankFormState = {
  bankName: string;
  branch: string;
  ifsc: string;
  holderName: string;
  accountNumber: string;
  confirmAccount: string;
  accountType: string;
};

export function validateBankDetails(
  form: BankFormState
): ValidationErrors<BankFormState> {
  const errors: Partial<Record<keyof BankFormState, string>> = {};

  if (!form.bankName.trim()) errors.bankName = "Bank Name is required";
  if (!form.branch.trim()) errors.branch = "Branch is required";
  if (!form.ifsc.trim()) errors.ifsc = "IFSC Code is required";
  else if (!isValidIFSC(form.ifsc)) errors.ifsc = "Enter a valid IFSC code (e.g. SBIN0001234)";
  if (!form.holderName.trim()) errors.holderName = "Account Holder Name is required";
  if (!form.accountNumber.trim()) errors.accountNumber = "Account Number is required";
  if (!form.accountType.trim()) errors.accountType = "Account Type is required";

  return errors;
}
