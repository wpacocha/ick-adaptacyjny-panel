# Adaptacyjny panel narzędzi

Projekt zaliczeniowy z przedmiotu **Interakcja człowiek-komputer** (PWr, 2026/2027).

Aplikacja webowa z interfejsem adaptacyjnym: menu narzędzi sortuje się według częstotliwości użycia, z sekcjami „Ostatnio używane” i „Więcej”, możliwością przypinania oraz resetem historii.

## Autorzy

- Oliwia Obiegla (272574)
- Wojciech Pacocha (272534)

## Uruchomienie

```bash
npm install
npm run dev
```

## Funkcje

- 18 prostych narzędzi (notatki, kalkulator, timer, konwerter, lista zadań i inne)
- zliczanie użyć i zapis w `localStorage`
- **wagi czasowe**: kliknięcie dziś ma pełną wagę, po 7 dniach połowę, po 14 dniach ćwierć (zanik wykładniczy)
- sortowanie menu według ważonej sumy użyć (przypięte na górze)
- sekcja „Ostatnio używane”
- rzadko używane narzędzia w sekcji „Więcej”
- przypinanie narzędzi
- przycisk resetu historii (z potwierdzeniem)
- tryb „Dlaczego tak?” (wyjaśnienie pozycji w menu)
- powiększanie przycisków o najwyższej wadze

## Technologie

React (Vite), CSS, `localStorage` — bez backendu.
