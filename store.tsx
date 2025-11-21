import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ingredient, MenuItem, Table, Order, Reservation, OrderStatus, TableStatus } from './types';
import { INITIAL_INGREDIENTS, INITIAL_TABLES, INITIAL_RESERVATIONS, MENU_ITEMS } from './constants';

interface AppContextType {
  ingredients: Ingredient[];
  tables: Table[];
  orders: Order[];
  reservations: Reservation[];
  activeOrder: Order | null;
  
  // Actions
  createOrder: (tableId: string) => void;
  addToOrder: (menuItem: MenuItem) => void;
  completeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deductInventory: (menuItem: MenuItem) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const createOrder = (tableId: string) => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      tableId,
      items: [],
      status: OrderStatus.PENDING,
      total: 0,
      timestamp: new Date(),
    };
    setOrders([...orders, newOrder]);
    setActiveOrder(newOrder);
    updateTableStatus(tableId, TableStatus.OCCUPIED);
  };

  const addToOrder = (menuItem: MenuItem) => {
    if (!activeOrder) return;

    const updatedOrder = { ...activeOrder };
    const existingItemIndex = updatedOrder.items.findIndex(i => i.menuItemId === menuItem.id);

    if (existingItemIndex >= 0) {
      updatedOrder.items[existingItemIndex].quantity += 1;
    } else {
      updatedOrder.items.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price
      });
    }

    updatedOrder.total += menuItem.price;
    
    // Update local active order state
    setActiveOrder(updatedOrder);
    
    // Update in global orders list
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const deductInventory = (menuItem: MenuItem) => {
    setIngredients(prevIngredients => {
      return prevIngredients.map(ing => {
        const recipeItem = menuItem.recipe.find(r => r.ingredientId === ing.id);
        if (recipeItem) {
          return { ...ing, stock: Math.max(0, ing.stock - recipeItem.quantity) };
        }
        return ing;
      });
    });
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, ...updates } : ing));
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Logic: When order is "Sent" to kitchen, deduct inventory
    order.items.forEach(item => {
      const menuItem = MENU_ITEMS.find(m => m.id === item.menuItemId);
      if (menuItem) {
        // Deduct for each quantity
        for(let i=0; i < item.quantity; i++) {
            deductInventory(menuItem);
        }
      }
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.PREPARING } : o));
    setActiveOrder(null);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  };
  
  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => res.id === id ? { ...res, ...updates } : res));
  };

  return (
    <AppContext.Provider value={{
      ingredients,
      tables,
      orders,
      reservations,
      activeOrder,
      createOrder,
      addToOrder,
      completeOrder,
      updateOrderStatus,
      updateTableStatus,
      addReservation,
      updateReservation,
      deductInventory,
      updateIngredient
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};