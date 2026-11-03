# Adaptacyjny panel narzędzi

Projekt zaliczeniowy z przedmiotu **Interakcja człowiek-komputer** (PWr, 2026/2027).

Aplikacja webowa z interfejsem adaptacyjnym: każdy użytkownik ma własny panel sortowany według ważonej historii użyć.

## Autorzy

- Oliwia Obiegla (272574)
- Wojciech Pacocha (272534)

## Uruchomienie

```bash
npm install
npm run dev
```

## Funkcje

- lokalne konta użytkowników (rejestracja / logowanie / wylogowanie)
- osobny panel i historia dla każdego konta
- 18 prostych narzędzi
- wagi czasowe użyć (zanik wykładniczy, półokres 7 dni)
- skróty top 5 w lewym panelu
- przypinanie narzędzi i reset historii
- tryb „Dlaczego tak?” oraz powiększanie popularnych przycisków

## Technologie

React (Vite), CSS, `localStorage` — bez backendu. Hasła lokalnie jako SHA-256 + sól.
