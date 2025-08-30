'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button'; // Assuming shadcn/ui
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Loader2, ShieldAlert } from 'lucide-react';

// Main component to display and manage user deletion
export function DeleteUserForm({ setView }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to manage the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/get-user'); 
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch users.');
        }
        const data = await response.json();
        setUsers(data.filter(user => user.user_type !== 'admin'));
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(`Error fetching users: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Opens the modal and sets the user to be deleted
  const handleOpenModal = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  // Closes the modal and resets the state
  const handleCloseModal = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };

  // Handles the final deletion after confirmation from the modal
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    // DEBUGGING: Check the ID and its type in the browser console
    console.log(`Attempting to delete user with ID: ${userToDelete.id} (Type: ${typeof userToDelete.id})`);

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/delete-user/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete the user.');
      }

      setUsers(currentUsers => currentUsers.filter(user => user.id !== userToDelete.id));
      toast.success(result.message);

    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
      handleCloseModal();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setView('menu')} title="Go Back">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h3 className="text-xl font-bold">Delete a User</h3>
          <p className="text-sm text-muted-foreground">Permanently remove a user and their data.</p>
        </div>
      </div>

      {isLoading && <p className="text-center text-muted-foreground">Loading users...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border dark:border-neutral-700 bg-white dark:bg-neutral-900"
              >
                <div>
                  <p className="font-semibold">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-muted-foreground">{user.email_id}</p>
                  <p className="text-sm text-muted-foreground">{user.user_type}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleOpenModal(user)}
                  title={`Delete ${user.first_name}`}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No users available to delete.</p>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm ">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 border-red-300 border-4">
            <div className="flex flex-col items-center text-center">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold">{userToDelete.first_name} {userToDelete.last_name}</span>?
              </p>
              <p className="text-sm text-red-500 mt-1 ">
                This will also delete all associated loan records. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleCloseModal} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting} className="hover:bg-yellow-500 ">
                {isDeleting ? <Loader2 className="animate-spin mr-2" /> : null}
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
