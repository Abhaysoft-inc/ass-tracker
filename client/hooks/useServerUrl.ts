import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_SERVER_URL = 'http://192.168.1.100:3000';

export const useServerUrl = () => {
    const [serverUrl, setServerUrl] = useState<string>(DEFAULT_SERVER_URL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServerUrl();
    }, []);

    const loadServerUrl = async () => {
        try {
            const savedUrl = await SecureStore.getItemAsync('serverUrl');
            if (savedUrl) {
                setServerUrl(savedUrl);
            }
        } catch (error) {
            console.error('Error loading server URL:', error);
        } finally {
            setLoading(false);
        }
    };

    return { serverUrl, loading };
};

export const getStoredServerUrl = async (): Promise<string> => {
    try {
        const savedUrl = await SecureStore.getItemAsync('serverUrl');
        return savedUrl || DEFAULT_SERVER_URL;
    } catch (error) {
        console.error('Error getting server URL:', error);
        return DEFAULT_SERVER_URL;
    }
};
