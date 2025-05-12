// $lib/stores/balanceStore.ts
import { writable } from 'svelte/store';

// Initialize with a default value (will be overwritten when data loads)
export const balanceStore = writable<number>(0);

// Function to update the store and sync with the server
export async function updateBalance(username: string, newBalance: number) {
    // Update the store first for immediate UI response
    balanceStore.set(newBalance);
    
    // Then update the server
    try {
        const res = await fetch('/api/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                balance: newBalance
            })
        });

        const result = await res.json();
        if (!result.success) {
            console.error('Balance update failed:', result.error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error updating balance:', error);
        return false;
    }
}