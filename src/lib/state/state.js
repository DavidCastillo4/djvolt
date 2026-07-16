import { atom } from 'jotai';

export const consentRules = atom(false);
export const amenityDetailsOpen = atom(false);
export const reviewRequiredOpen = atom(false);
export const signature = atom('');
export const cal = atom([]);
export const mobile = atom('')
export const email = atom('')

export const date = atom()
export const slot = atom('')

export const nameFirst = atom('')
export const nameLast = atom('')
export const streetAddress = atom('')
export const homeOwner = atom(null)

export const notes = atom('')


const Today = new Date();

export const month = atom(
  Today.toLocaleString('en-US', { month: 'long' })
);

export const year = atom(
  Today.getFullYear()
);
