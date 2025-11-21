import React, { useState } from 'react';
import { useAppStore } from '../store';
import { MenuItem } from '../types';
import { Lock, Save, Plus, Trash2, AlertTriangle, Activity, Database, Bot, Settings, RefreshCcw, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0000FF', '#FFBF00', '#BEF754', '#FF00FF', '#00FFFF'];

const Admin = () => {
  const { menuItems, updateMenuItem, addMenuItem, deleteMenuItem, systemPrompt, updateSystemPrompt, orders, ingredients } = useAppStore();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MENU' | 'AI' | 'SYSTEM'>('DASHBOARD');
  
  // Forms
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [promptForm, setPromptForm] = useState(systemPrompt);

  const handleLogin = () => {
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN. Hint: 1234');
      setPin('');
    }
  };

  const handleSaveMenuItem = () => {
    if (!editItem || !editItem.name || !editItem.price) return;
    
    if (isNewItem) {
      const newItem: MenuItem = {
        id: `menu_${Date.now()}`,
        name: editItem.name,
        price: Number(editItem.price),
        category: editItem.category || 'FOOD',
        color: editItem.color || 'bg-shift-gray',
        recipe: [] // Simplified for this demo
      };
      addMenuItem(newItem);
    } else if (editItem.id) {
      updateMenuItem(editItem.id, editItem);
    }
    
    setEditItem(null);
    setIsNewItem(false);
  };

  const handleSavePrompt = () => {
    updateSystemPrompt(promptForm);
    alert('AI Persona Updated Successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 bg-shift-dark rounded-full flex items-center justify-center mx-auto text-white">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-shift-dark">Admin Access</h2>
            <p className="text-gray-500">Enter security PIN to continue</p>
          </div>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="w-full text-center text-4xl tracking-widest font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-shift-blue focus:outline-none"
            placeholder="••••"
          />
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-shift-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            UNLOCK PANEL
          </button>
          <p className="text-xs text-gray-300">Dev Hint: 1234</p>
        </div>
      </div>
    );
  }

  // Analytics Data Prep
  const salesByCategory = menuItems.map(item => {
    const count = orders.reduce((acc, order) => acc + order.items.filter(i => i.menuItemId === item.id).reduce((s, i) => s + i.quantity, 0), 0);
    return { name: item.name, value: count };
  }).filter(i => i.value > 0);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <Activity className="text-shift-blue" /> Admin Console
           </h1>
           <p className="text-sm text-gray-500">System configuration and advanced analytics.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
           {['DASHBOARD', 'MENU', 'AI', 'SYSTEM'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                 activeTab === tab 
                   ? 'bg-shift-dark text-white' 
                   : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* DASHBOARD TAB */}
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold mb-4">Sales Mix by Item</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={salesByCategory}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {salesByCategory.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
             
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold mb-4">Inventory Health</h3>
               <div className="space-y-4">
                 {ingredients.slice(0, 5).map(ing => (
                   <div key={ing.id}>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold">{ing.name}</span>
                       <span className="text-gray-500">{ing.stock} / {ing.threshold * 3} {ing.unit}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${ing.stock < ing.threshold ? 'bg-red-500' : 'bg-green-500'}`} 
                         style={{ width: `${Math.min(100, (ing.stock / (ing.threshold * 3)) * 100)}%` }}
                       />
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'MENU' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold">Menu Management</h3>
               <button 
                 onClick={() => { setIsNewItem(true); setEditItem({ name: '', price: 0, category: 'FOOD', color: 'bg-shift-gray' }); }}
                 className="flex items-center gap-2 bg-shift-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
               >
                 <Plus size={16} /> Add Item
               </button>
             </div>
             
             {editItem && (
               <div className="p-6 bg-blue-50 border-b border-blue-100 animate-fade-in">
                  <h4 className="font-bold text-blue-800 mb-4">{isNewItem ? 'Create New Item' : 'Edit Item'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                      <input 
                        className="w-full p-2 border rounded bg-white" 
                        value={editItem.name} 
                        onChange={e => setEditItem({...editItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                      <input 
                        type="number"
                        className="w-full p-2 border rounded bg-white" 
                        value={editItem.price} 
                        onChange={e => setEditItem({...editItem, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                      <select 
                         className="w-full p-2 border rounded bg-white"
                         value={editItem.category}
                         onChange={e => setEditItem({...editItem, category: e.target.value as any})}
                      >
                        <option value="FOOD">FOOD</option>
                        <option value="DRINK">DRINK</option>
                        <option value="DESSERT">DESSERT</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Color Class</label>
                      <input 
                        className="w-full p-2 border rounded bg-white" 
                        value={editItem.color} 
                        onChange={e => setEditItem({...editItem, color: e.target.value})}
                        placeholder="bg-shift-..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveMenuItem} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Save</button>
                    <button onClick={() => setEditItem(null)} className="text-gray-500 px-4 py-2 hover:bg-gray-200 rounded">Cancel</button>
                  </div>
               </div>
             )}

             <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                 <tr>
                   <th className="px-6 py-3">Name</th>
                   <th className="px-6 py-3">Category</th>
                   <th className="px-6 py-3 text-right">Price</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {menuItems.map(item => (
                   <tr key={item.id} className="hover:bg-gray-50">
                     <td className="px-6 py-3 font-medium">{item.name}</td>
                     <td className="px-6 py-3">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${item.category === 'FOOD' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                         {item.category}
                       </span>
                     </td>
                     <td className="px-6 py-3 text-right font-mono">${item.price.toFixed(2)}</td>
                     <td className="px-6 py-3 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => { setIsNewItem(false); setEditItem(item); }} className="p-2 hover:bg-gray-200 rounded-full text-blue-600"><Settings size={16}/></button>
                         <button onClick={() => deleteMenuItem(item.id)} className="p-2 hover:bg-red-100 rounded-full text-red-600"><Trash2 size={16}/></button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'AI' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
             <div className="flex items-start gap-4 mb-6">
               <div className="p-3 bg-shift-magenta text-white rounded-lg">
                 <Bot size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-lg">AI Personality Trainer</h3>
                 <p className="text-gray-500 text-sm">Configure the system prompt and context for ShiftBot.</p>
               </div>
             </div>
             
             <div className="space-y-4">
               <label className="block font-bold text-sm">System Instruction / Persona</label>
               <textarea 
                 className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:border-shift-magenta focus:outline-none resize-none"
                 value={promptForm}
                 onChange={(e) => setPromptForm(e.target.value)}
               />
               <div className="flex justify-between items-center">
                 <p className="text-xs text-gray-400">Changes apply to new chat sessions immediately.</p>
                 <button 
                   onClick={handleSavePrompt}
                   className="px-6 py-3 bg-shift-dark text-white font-bold rounded-xl hover:bg-black flex items-center gap-2"
                 >
                   <Save size={18} /> Update Persona
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'SYSTEM' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
             <h3 className="font-bold text-lg mb-6 text-red-600 flex items-center gap-2">
               <AlertTriangle size={20} /> Danger Zone
             </h3>
             <div className="p-4 border border-red-100 bg-red-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-red-900">Factory Reset</p>
                  <p className="text-sm text-red-700">Clears all local data, orders, and reservations.</p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                >
                  Reset App
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;