// src/components/modals/SignOutModal.js
"use client";
import React from "react";

export const SignOutModal = ({ isOpen, onClose, userName, email, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
   
    <div
      className="fixed inset-0 z-50 flex items-center justify-center shadow-2xl"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="relative w-full max-w-md p-6 mx-4 bg-gray-100 rounded-lg shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirm Sign Out
          </h3>
          <div className="mt-4 text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You are currently signed in as:
            </p>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {userName || "User"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {email}
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to sign out?
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
