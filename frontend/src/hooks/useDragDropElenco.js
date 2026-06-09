// Hook que orquestra o drag-and-drop do @dnd-kit entre o Mercado e o Pitch.
// - Cada slot do pitch é um useDroppable com id: `slot-${posicao}-${index}`.
// - Cada card do mercado é um useDraggable com id: `card-${jogadorId}`.
// - DnDContext precisa envolver ambos os componentes (feito no DashboardFantasy).

import { useState, useCallback } from 'react';

export function useDragDropElenco({ onDrop }) {
  const [activeDrag, setActiveDrag] = useState(null); // { type: 'slot' | 'card', payload }
  const [overSlot, setOverSlot] = useState(null);     // { posicao, index, valid }

  const handleDragStart = useCallback((event) => {
    const id = event.active.id;
    if (typeof id === 'string' && id.startsWith('card-')) {
      const jogadorId = Number(id.replace('card-', ''));
      const jogador = event.active.data.current?.jogador;
      setActiveDrag({ type: 'card', jogadorId, jogador });
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('slot-')) {
      const [, posicao, index] = overId.split('-');
      setOverSlot({ posicao, index: Number(index) });
    } else {
      setOverSlot(null);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveDrag(null);
    setOverSlot(null);

    if (!over) return;

    const overId = over.id;
    if (typeof overId !== 'string' || !overId.startsWith('slot-')) return;

    const [, posicao, indexStr] = overId.split('-');
    const index = Number(indexStr);

    if (typeof active.id === 'string' && active.id.startsWith('card-')) {
      const jogadorId = Number(active.id.replace('card-', ''));
      const jogador = active.data.current?.jogador;
      if (jogador) {
        onDrop?.({ jogador, slot: { posicao, index } });
      }
    }
  }, [onDrop]);

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setOverSlot(null);
  }, []);

  return {
    activeDrag,
    overSlot,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

// Util: parse slot id usado pelo PitchField.
export function parseSlotId(id) {
  if (typeof id !== 'string' || !id.startsWith('slot-')) return null;
  const [, posicao, indexStr] = id.split('-');
  return { posicao, index: Number(indexStr) };
}

export function makeSlotId(posicao, index) {
  return `slot-${posicao}-${index}`;
}

export function makeCardId(jogadorId) {
  return `card-${jogadorId}`;
}
