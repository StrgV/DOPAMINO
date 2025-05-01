import { writable } from 'svelte/store';

export const balanceStore = writable<number>(0); // Initialize with 0 or a default value
