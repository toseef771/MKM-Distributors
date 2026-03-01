# MKM Distributor — Medicine Distribution App

## Overview
A professional React Native (Expo) app with a dual-panel system for medicine distribution management. Distributors can submit daily reports and admins can manage all data in real-time.

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js (serves landing page + API)
- **Database**: Firebase Realtime Database (real-time sync across cities)
- **State**: React Context (AuthContext), AsyncStorage for session persistence
- **Styling**: LinearGradient (blue theme), Poppins font family

## Firebase Config
- Project: mkm-distributor-hub
- Database URL: https://mkm-distributor-hub-default-rtdb.firebaseio.com
- Data structure:
  - `/distributors/{phone}` — distributor profiles
  - `/reports/{phone}/{reportId}` — daily reports
  - `/admin/credentials` — admin username/password

## App Structure
```
app/
  _layout.tsx              # Root layout with providers
  index.tsx                # Welcome screen (choose panel)
  distributor/
    login.tsx              # Distributor login
    signup.tsx             # Distributor registration
    dashboard.tsx          # Daily report submission
    history.tsx            # View/edit current month reports
  admin/
    login.tsx              # Admin login + change credentials
    dashboard.tsx          # All distributors list
    distributor/[id].tsx   # Specific distributor history
context/
  AuthContext.tsx          # Auth state management
lib/
  firebase.ts              # Firebase initialization
  query-client.ts          # React Query client
components/
  GradientBackground.tsx   # Reusable gradient background
  Footer.tsx               # Credit footer (mandatory on all screens)
  StyledInput.tsx          # Themed input component
  StyledButton.tsx         # Themed button component
```

## Panels

### Distributor Panel
- **Signup**: Full Name, Shop Name, Phone (unique ID), City, Password
- **Login**: Phone + Password
- **Dashboard**: Submit daily reports (City, Date, Note)
- **History**: View and edit current month's reports

### Admin Panel
- **Login**: Username + Password (default: admin / mkm2024)
- **Change Credentials**: Requires old password verification
- **Dashboard**: Real-time list of all distributors
- **Distributor Detail**: View monthly reports, delete monthly data, delete account

## Design
- Blue linear gradient background on every screen (#0A1628 → #0D3B7A → #1565C0 → #00B4D8)
- Poppins font family (400, 600, 700)
- Footer on every screen: "Designed and Developed by Toseef Bhatti | Instructions by Amir Shahzad"

## Workflows
- `Start Backend`: Express server on port 5000
- `Start Frontend`: Expo dev server on port 8081

## Dependencies
- firebase (Realtime Database)
- @expo-google-fonts/poppins
- expo-linear-gradient
- expo-haptics
- react-native-safe-area-context
