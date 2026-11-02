import Notes from '../tools/Notes'
import Calculator from '../tools/Calculator'
import Timer from '../tools/Timer'
import UnitConverter from '../tools/UnitConverter'
import TodoList from '../tools/TodoList'
import Stopwatch from '../tools/Stopwatch'
import PasswordGenerator from '../tools/PasswordGenerator'
import Counter from '../tools/Counter'
import Dice from '../tools/Dice'
import RandomNumber from '../tools/RandomNumber'
import ColorPicker from '../tools/ColorPicker'
import Countdown from '../tools/Countdown'
import BmiCalculator from '../tools/BmiCalculator'
import PercentageCalc from '../tools/PercentageCalc'
import TextCase from '../tools/TextCase'
import WordCounter from '../tools/WordCounter'
import TipCalculator from '../tools/TipCalculator'
import AgeCalculator from '../tools/AgeCalculator'

/** Liczba skrótów w lewym panelu (najwyższa waga). */
export const SIDEBAR_LIMIT = 5
export const RECENT_LIMIT = 4

export const tools = [
  { id: 'notes', name: 'Notatki', description: 'Szybkie notatki zapisywane lokalnie', icon: '📝', Component: Notes },
  { id: 'calculator', name: 'Kalkulator', description: 'Podstawowe działania matematyczne', icon: '🔢', Component: Calculator },
  { id: 'timer', name: 'Timer', description: 'Odliczanie czasu z alarmem', icon: '⏱️', Component: Timer },
  { id: 'converter', name: 'Konwerter jednostek', description: 'Długość, masa, temperatura', icon: '📐', Component: UnitConverter },
  { id: 'todos', name: 'Lista zadań', description: 'Proste todo z odznaczaniem', icon: '✅', Component: TodoList },
  { id: 'stopwatch', name: 'Stoper', description: 'Pomiar upływającego czasu', icon: '⏲️', Component: Stopwatch },
  { id: 'password', name: 'Generator haseł', description: 'Losowe hasła o wybranej sile', icon: '🔐', Component: PasswordGenerator },
  { id: 'counter', name: 'Licznik', description: 'Prosty licznik kliknięć', icon: '➕', Component: Counter },
  { id: 'dice', name: 'Kostka', description: 'Rzut jedną lub wieloma kośćmi', icon: '🎲', Component: Dice },
  { id: 'random', name: 'Losowa liczba', description: 'Liczba z wybranego zakresu', icon: '🎰', Component: RandomNumber },
  { id: 'color', name: 'Selektor kolorów', description: 'HEX, RGB i podgląd barwy', icon: '🎨', Component: ColorPicker },
  { id: 'countdown', name: 'Odliczanie daty', description: 'Ile dni do wybranego wydarzenia', icon: '📅', Component: Countdown },
  { id: 'bmi', name: 'Kalkulator BMI', description: 'Wskaźnik masy ciała', icon: '⚖️', Component: BmiCalculator },
  { id: 'percent', name: 'Procenty', description: 'Obliczanie procentów', icon: '%', Component: PercentageCalc },
  { id: 'textcase', name: 'Zmiana wielkości liter', description: 'UPPER, lower, Title Case', icon: '🔤', Component: TextCase },
  { id: 'wordcount', name: 'Licznik znaków', description: 'Znaki, słowa i zdania', icon: '📊', Component: WordCounter },
  { id: 'tip', name: 'Napiwek', description: 'Podział rachunku i napiwek', icon: '💸', Component: TipCalculator },
  { id: 'age', name: 'Wiek', description: 'Dokładny wiek na podstawie daty', icon: '🎂', Component: AgeCalculator },
]

export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]))
