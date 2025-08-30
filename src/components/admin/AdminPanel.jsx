'use client';

import React, { useState } from 'react';
import { UserPlus, Edit, ShieldX } from 'lucide-react';
import { AddUserForm } from './AddUserForm';
import {  ModifyUserList } from './ModifyUserForm';
import {  DeleteUserForm } from './BlockUserForm'; 

const AdminMenuItem = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 w-full text-left transition-colors"
  >
    <div className="flex-shrink-0 text-neutral-500">{icon}</div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  </button>
);

export function AdminPanel() {
  const [view, setView] = useState('menu');

  const renderMenu = () => (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Admin Panel</h3>
        <p className="text-sm text-muted-foreground">Select an action to perform.</p>
      </div>
      <div className="space-y-2">
        <AdminMenuItem
          icon={<UserPlus size={24} />}
          title="Add User"
          description="Create a new user account."
          onClick={() => setView('addUser')}
        />
        <AdminMenuItem
          icon={<Edit size={24} />}
          title="Modify User"
          description="Edit an existing user's details."
          onClick={() => setView('modifyUser')}
        />
        <AdminMenuItem
          icon={<ShieldX size={24} />} 
          title="Block User"
          description="Revoke a user's access."
          onClick={() => setView('blockUser')}
        />
      </div>
    </div>
  );

  switch (view) {
    case 'addUser':
      return <AddUserForm setView={setView} />;
    case 'modifyUser':
      return <ModifyUserList setView={setView} />;
   
    case 'blockUser':
      return <DeleteUserForm setView={setView} />;
    default:
      return renderMenu();
  }
}