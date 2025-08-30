'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, User, Edit } from 'lucide-react';

export function ModifyUserList({ setView }) {
  // NEW: State for the list of all users
  const [allUsers, setAllUsers] = useState([]);
  // CHANGED: Renamed `userData` to `selectedUser` for clarity
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: Fetch all users when the component mounts
  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(true);
      try {
        // IMPORTANT: You will need to create this new API endpoint
        const response = await fetch('/api/admin/get-user');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users.');
        }
        setAllUsers(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // This function remains largely the same
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user.');
      }
      toast.success(result.message);
  
      setSelectedUser(null); 

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [id]: value }));
  };
  

  const handleSelectUser = (user) => {
   
    setSelectedUser({
      firstName: user.first_name,
      lastName: user.last_name,
      number: user.phone_number,
      email: user.email_id,
    });
  };


  if (selectedUser) {
    return (
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Modify User Details</h3>
          <p className="text-sm text-muted-foreground">
            Edit details for <span className="font-semibold">{selectedUser.email}</span>.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Cannot be changed)</Label>
          <Input id="email" value={selectedUser.email} readOnly className="bg-gray-100 dark:bg-neutral-800" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={selectedUser.firstName} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={selectedUser.lastName} onChange={handleInputChange} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="number">Phone Number</Label>
          <Input id="number" type="tel" value={selectedUser.number} onChange={handleInputChange} required />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)} disabled={isLoading}>
            Back to List
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Button size="icon" variant="ghost" onClick={() => setView('menu')} className="flex-shrink-0">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h3 className="text-lg font-medium">Modify User</h3>
          <p className="text-sm text-muted-foreground">Select a user to edit their details.</p>
        </div>
      </div>
      
      {isLoading && allUsers.length === 0 ? (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-md">
            {allUsers.map((user) => (
                <div key={user.email_id} className="flex items-center justify-between overflow-hidden p-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-full">
                            <User size={16} className="text-secondary-foreground"/>
                        </div>
                        <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email_id}</p>
                            <p className="text-sm text-muted-foreground">{user.user_type.toUpperCase()}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSelectUser(user)}>
                        <Edit size={14} className="mr-2"/>
                        Edit
                    </Button>
                </div>
            ))}
        </div>
      )}

      { !isLoading && allUsers.length === 0 && (
         <p className="text-center text-muted-foreground py-4">No users found.</p>
      )}
    </div>
  );
}