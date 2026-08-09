import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, CharacterSlot, ElementId } from "../types";
import type { SlotFill } from "../utils/autofill";

export const MAX_CHARACTERS = 3;
export const SLOT_COUNT = 3;

interface CharactersState {
  characters: Character[];
  /** Adds a character; no-op when the party is full (max 3). */
  addCharacter: () => void;
  /** Removes a character; no-op when only one remains. */
  removeCharacter: (id: string) => void;
  updateName: (id: string, name: string) => void;
  setElement: (id: string, slot: number, element: ElementId | null) => void;
  toggleSlotDisabled: (id: string, slot: number) => void;
  /** Applies computed auto-fill results to empty slots. */
  fillSlots: (fills: SlotFill[]) => void;
}

function createSlots(): CharacterSlot[] {
  return Array.from({ length: SLOT_COUNT }, () => ({ element: null, disabled: false }));
}

function createCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: "",
    slots: createSlots(),
  };
}

/**
 * The user-configurable party. Persisted to localStorage so the setup
 * survives page reloads.
 */
export const useCharactersStore = create<CharactersState>()(
  persist(
    (set) => ({
      characters: [createCharacter()],
      addCharacter: () =>
        set((state) =>
          state.characters.length >= MAX_CHARACTERS
            ? state
            : {
                characters: [...state.characters, createCharacter()],
              },
        ),
      removeCharacter: (id) =>
        set((state) =>
          state.characters.length <= 1
            ? state
            : {
                characters: state.characters.filter((character) => character.id !== id),
              },
        ),
      updateName: (id, name) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === id ? { ...character, name } : character,
          ),
        })),
      setElement: (id, slot, element) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === id
              ? {
                  ...character,
                  slots: character.slots.map((value, index) =>
                    index === slot ? { ...value, element } : value,
                  ),
                }
              : character,
          ),
        })),
      toggleSlotDisabled: (id, slot) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === id
              ? {
                  ...character,
                  slots: character.slots.map((value, index) =>
                    index === slot ? { ...value, disabled: !value.disabled } : value,
                  ),
                }
              : character,
          ),
        })),
      fillSlots: (fills) =>
        set((state) => ({
          characters: state.characters.map((character) => {
            const relevant = fills.filter((fill) => fill.characterId === character.id);
            if (relevant.length === 0) return character;
            const slots = [...character.slots];
            for (const fill of relevant) {
              slots[fill.slotIndex] = { element: fill.element, disabled: false };
            }
            return { ...character, slots };
          }),
        })),
    }),
    {
      name: "xb2-characters",
      /** Migrates persisted pre-slot data (`elements`) into the new slots shape. */
      merge: (persisted, current) => {
        const stored = (persisted as Partial<CharactersState> | undefined)?.characters;
        return {
          ...current,
          ...(persisted as object),
          characters:
            stored && stored.length > 0
              ? stored.map((character) => {
                  const legacy = character as Character & {
                    elements?: (ElementId | null)[];
                  };
                  return {
                    ...character,
                    slots:
                      legacy.slots?.length === SLOT_COUNT
                        ? legacy.slots
                        : (legacy.elements?.map((element) => ({ element, disabled: false })) ??
                          createSlots()),
                  };
                })
              : current.characters,
        };
      },
    },
  ),
);
