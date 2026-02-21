# TODO - Add Listing Category Selection During Registration

## Task Summary
Add listing category selection (Property/Job/Both) for employer role during registration

## Steps to Complete:
- [x] 1. Update types/index.ts - Add new types for listing categories
- [x] 2. Update context/AuthContext.tsx - Add state for listing category
- [x] 3. Update screens/auth/RoleSelectionScreen.tsx - Add sub-selection for employer role
- [x] 4. Update screens/auth/ProfileCreationScreen.tsx - Adapt UI based on category

## Files Edited:
- src/types/index.ts
- src/context/AuthContext.tsx
- src/screens/auth/RoleSelectionScreen.tsx
- src/screens/auth/ProfileCreationScreen.tsx

## Summary of Changes:
1. Added `ListingCategory` type ('property' | 'job' | 'both' | null)
2. Added `listingCategory` field to UserProfile interface
3. Updated AuthStackParamList to pass listingCategory to ProfileCreation
4. Updated AuthContext to manage listingCategory state
5. Updated RoleSelectionScreen to show category selection when employer role is chosen
6. Updated ProfileCreationScreen to display the selected listing category
