import * as SecureStore from 'expo-secure-store';

// Get the base URL from secure storage
export const getServerUrl = async (): Promise<string> => {
    try {
        const savedUrl = await SecureStore.getItemAsync('serverUrl');
        if (savedUrl) {
            return savedUrl;
        }
        // Fallback to default if not configured
        return "http://172.20.47.62:3000";
    } catch (error) {
        console.error('Error getting server URL:', error);
        return "http://172.20.47.62:3000";
    }
};

// Set the server URL
export const setServerUrl = async (url: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync('serverUrl', url);
    } catch (error) {
        console.error('Error setting server URL:', error);
        throw error;
    }
};

// Clear the server URL (for logout/reset)
export const clearServerUrl = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync('serverUrl');
    } catch (error) {
        console.error('Error clearing server URL:', error);
    }
};

// Validate server URL format
export const validateServerUrl = (url: string): boolean => {
    try {
        // Remove protocol if present for validation
        const cleanUrl = url.replace(/^https?:\/\//, '');

        // Check if it's a valid IP:port or domain:port format
        const urlPattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9.-]+):(\d{1,5})$/;
        return urlPattern.test(cleanUrl);
    } catch {
        return false;
    }
};

// Test server connection
export const testServerConnection = async (url?: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const testUrl = url || await getServerUrl();
        const formattedUrl = testUrl.startsWith('http') ? testUrl : `http://${testUrl}`;

        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });

        const fetchPromise = fetch(`${formattedUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: `Server responded with status: ${response.status}` };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Connection failed'
        };
    }
};
