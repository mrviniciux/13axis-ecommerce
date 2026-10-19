import { create } from 'zustand';

type CartState = {
  quantity: number;
  addItem: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  quantity: 0,
  addItem: () => set((state) => ({ quantity: state.quantity + 1 })),
}));
