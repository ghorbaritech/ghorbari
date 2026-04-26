# Building the Ghorbari Consumer App

## Prerequisites
- Flutter SDK 3.x
- Dart SDK ≥ 3.0.0
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds — macOS only)

---

## Development (Windows / Any Platform)

```bash
cd mobile/ghorbari_consumer
flutter pub get
flutter run
```

> **Note on `flutter_localizations`:** The app uses `easy_localization` for bilingual Bengali/English support. Translation files are in `assets/translations/`.

---

## ⚠️ Known Build Workaround — Windows-Only

The `pubspec.yaml` contains the following dependency overrides:

```yaml
dependency_overrides:
  objective_c:
    path: libs/objective_c_mock
  native_toolchain_c:
    path: libs/native_toolchain_c_mock
```

### Why This Exists
These mock packages were added to unblock Windows development builds. The real `objective_c` and `native_toolchain_c` packages are macOS-specific native toolchain dependencies that fail to resolve on Windows (even for non-iOS targets, due to Dart pub's cross-platform resolution).

### What This Means Per Platform

| Platform | Build Status | Notes |
|---|---|---|
| Windows (Android target) | ✅ Works | Mocks allow dev builds |
| macOS (iOS/Android target) | ❌ **BLOCKED** | Remove overrides before building |
| CI/CD (Linux) | ❌ **BLOCKED** | Remove overrides before building |

### How to Build for iOS / App Store

**Before submitting to the App Store or running on a macOS CI:**

1. Remove the `dependency_overrides` block from `pubspec.yaml`
2. Run `flutter pub get` to fetch the real packages
3. Resolve any native linking errors (typically none on macOS with Xcode 15+)
4. Run `flutter build ios --release`

**TODO (Architect Ticket):** Investigate whether a CI script can conditionally apply/remove the overrides based on the build platform, allowing a single `pubspec.yaml` to work everywhere.

---

## Disabled Phase 3 Dependencies

The following packages are commented out and staged for Phase 3:

```yaml
# geolocator: ^13.0.1       — Location tracking for site engineers
# speech_to_text: ^7.0.0    — Voice input for Bengali/English
# flutter_tts: ^4.2.2       — Text-to-speech for accessibility
# image_picker: ^1.1.2      — Photo upload for progress tracking
# pointer_interceptor: ^0.10.1+2 — Web overlay fix
```

Re-enable these by uncommenting in `pubspec.yaml` and running `flutter pub get`.

---

## State Management Architecture

The app uses **flutter_bloc** (BLoC pattern) for state management. Each feature module in `lib/features/` manages its own BLoC:

```
lib/features/
├── auth/         — AuthBloc
├── marketplace/  — ProductsBloc, CatalogBloc
├── bookings/     — BookingBloc
├── cart/         — CartBloc
├── design/       — DesignBloc
├── services/     — ServicesBloc
└── tools/        — CalculatorBloc
```

## Supabase Configuration

The app connects to the same Supabase project as the web:
- URL: Set in `lib/main.dart` via `Supabase.initialize()`
- Anon Key: Set in `lib/main.dart` — **keep this out of git for production**
- RLS: Same Row Level Security policies apply as the web platform
