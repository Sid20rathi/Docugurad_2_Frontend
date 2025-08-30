'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import toast from 'react-hot-toast'; 

export function AddUserForm({ setView }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    number: '',
    password: '',
    user_type: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      toast.success('User added successfully!');
      setView('menu');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Add New User</h3>
        <p className="text-sm text-muted-foreground">
          Enter the details for the new user.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="user@example.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Phone Number</Label>
        <Input id="number" type="tel" value={formData.number} onChange={handleInputChange} placeholder="Phone Number" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
      </div>

      {/* user_type dropdown restricted to agent or manager */}
      <div className="space-y-2">
        <Label htmlFor="user_type">User Type</Label>
        <select
          id="user_type"
          value={formData.user_type}
          onChange={handleInputChange}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select user type</option>
          <option value="agent">Agent</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={() => setView('menu')} disabled={isLoading}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}
