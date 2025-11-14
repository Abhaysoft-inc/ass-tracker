import * as SecureStore from 'expo-secure-store';
import { getServerUrl } from '../config/serverConfig';

// Types
export interface Assignment {
    id: number;
    title: string;
    description: string;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    batch: {
        BatchId: number;
        BatchName: string;
    };
    faculty: {
        id: number;
        name: string;
    };
    dueDate: string;
    totalMarks: number;
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    createdAt: string;
    submissions?: AssignmentSubmission[];
    submissionCount?: number;
    totalStudents?: number;
}

export interface AssignmentSubmission {
    id: number;
    studentId: number;
    assignmentId: number;
    submissionText?: string;
    fileUrl?: string;
    marksObtained?: number;
    feedback?: string;
    status: 'SUBMITTED' | 'GRADED' | 'LATE_SUBMISSION';
    submittedAt: string;
    student?: {
        id: number;
        name: string;
        rollNumber: string;
    };
}

export interface Notification {
    id: number;
    type: 'ASSIGNMENT' | 'CIRCULAR' | 'EVENT' | 'RESULT' | 'GENERAL';
    title: string;
    message: string;
    targetType: 'ALL' | 'BATCH' | 'DEPARTMENT' | 'INDIVIDUAL';
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: number;
        name: string;
        role: string;
    };
}

export interface SyllabusSubject {
    id: number;
    name: string;
    code: string;
    overallProgress: number;
    totalUnits: number;
    completedUnits: number;
    syllabusUnits: SyllabusUnit[];
    facultyBatchSubjects: {
        faculty: {
            id: number;
            name: string;
            email: string;
        };
    }[];
}

export interface SyllabusUnit {
    id: number;
    unitNumber: number;
    title: string;
    description?: string;
    weightage: number;
    topics: SyllabusTopic[];
    progress: SyllabusProgress[];
}

export interface SyllabusTopic {
    id: number;
    topicNumber: number;
    title: string;
    description?: string;
    estimatedHours: number;
    progress: SyllabusTopicProgress[];
}

export interface SyllabusProgress {
    id: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completionPercent: number;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    faculty: {
        id: number;
        name: string;
    };
}

export interface SyllabusTopicProgress {
    id: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    taughtAt?: string;
    notes?: string;
}

// API Helper functions
async function getAuthToken(): Promise<string | null> {
    // Try to get token from different storage keys based on user role
    const tokenKeys = ['loginToken', 'hodToken', 'facultyToken', 'token'];
    
    for (const key of tokenKeys) {
        try {
            const token = await SecureStore.getItemAsync(key);
            if (token) {
                console.log(`Found token from ${key}:`, token.substring(0, 50) + '...');
                return token;
            }
        } catch (error) {
            console.warn(`Error getting token from ${key}:`, error);
        }
    }
    
    console.log('No token found in any storage key');
    return null;
}

async function getAuthHeaders() {
    const token = await getAuthToken();
    const serverUrl = await getServerUrl();

    // Ensure URL has proper protocol
    const formattedUrl = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        baseURL: formattedUrl
    };
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers = await getAuthHeaders();
    const url = `${headers.baseURL}${endpoint}`;

    // Debug logging
    console.log('API Request:', { endpoint, url, hasAuth: !!headers.Authorization });

    // Check if we have a token for authenticated endpoints
    if (!headers.Authorization && !endpoint.includes('/health') && !endpoint.includes('/auth/')) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        try {
            const errorBody = await response.json();
            console.log('API Error Response:', errorBody);
            if (errorBody.error) {
                errorMessage = errorBody.error;
            } else if (errorBody.message) {
                errorMessage = errorBody.message;
            }
        } catch (parseError) {
            // If we can't parse the error response, use default messages
            if (response.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (response.status === 403) {
                errorMessage = 'Access denied. You may not have permission to access this resource.';
            } else if (response.status === 404) {
                errorMessage = 'Resource not found.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
        }
        
        console.log('Final error message:', errorMessage);
        throw new Error(errorMessage);
    }

    return await response.json();
}

// Health check API
export const healthAPI = {
    async checkConnection(): Promise<{ success: boolean; message?: string }> {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${headers.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, message: data.message || 'Server is healthy' };
            } else {
                return { success: false, message: `Server error: ${response.status}` };
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Connection failed'
            };
        }
    }
};

// HOD APIs
export const hodAPI = {
    async getAnalytics(): Promise<{
        quickStats: {
            totalStudents: number;
            totalFaculty: number;
            activeBatches: number;
            totalSubjects: number;
            totalAssignments: number;
            pendingAssignments: number;
            recentNotifications: number;
        };
        recentActivities: {
            activity: string;
            time: string;
            type: string;
        }[];
    }> {
        const response = await apiRequest('/hod/analytics');
        return response.data;
    },
};

// Assignment APIs
export const assignmentAPI = {
    // HOD APIs
    async getHODAssignments(): Promise<Assignment[]> {
        const response = await apiRequest('/assignments/hod/assignments');
        return response.data || [];
    },

    async createAssignment(assignmentData: {
        title: string;
        description: string;
        subjectId: number;
        batchId: number;
        facultyId: number;
        dueDate: string;
        totalMarks: number;
    }): Promise<Assignment> {
        const response = await apiRequest('/assignments/hod/create', {
            method: 'POST',
            body: JSON.stringify(assignmentData),
        });
        return response.data;
    },

    async getAssignmentSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
        const response = await apiRequest(`/assignments/hod/assignments/${assignmentId}/submissions`);
        return response.data || [];
    },

    // Faculty APIs
    async getFacultyAssignments(): Promise<Assignment[]> {
        const response = await apiRequest('/assignments/faculty/my-assignments');
        return response.data || [];
    },

    async gradeSubmission(submissionId: number, marksObtained: number, feedback?: string): Promise<void> {
        await apiRequest(`/assignments/faculty/submissions/${submissionId}/grade`, {
            method: 'PUT',
            body: JSON.stringify({ marksObtained, feedback }),
        });
    },

    // Student APIs
    async getStudentAssignments(): Promise<Assignment[]> {
        const response = await apiRequest('/assignments/student/assignments');
        return response.data || [];
    },

    async submitAssignment(assignmentId: number, submissionData: {
        submissionText?: string;
        fileUrl?: string;
    }): Promise<void> {
        await apiRequest(`/assignments/student/assignments/${assignmentId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData),
        });
    },

    async getMySubmissions(): Promise<AssignmentSubmission[]> {
        const response = await apiRequest('/assignments/student/my-submissions');
        return response.data || [];
    },
};

// Notification APIs
export const notificationAPI = {
    // HOD APIs
    async createNotification(notificationData: {
        type: string;
        title: string;
        message: string;
        targetType: string;
        targetBatchIds?: number[];
        targetStudentIds?: number[];
    }): Promise<void> {
        await apiRequest('/notifications/hod/create', {
            method: 'POST',
            body: JSON.stringify(notificationData),
        });
    },

    async getHODNotifications(): Promise<Notification[]> {
        const response = await apiRequest('/notifications/hod/notifications');
        return response.data || [];
    },

    // Faculty APIs
    async getFacultyNotifications(): Promise<Notification[]> {
        const response = await apiRequest('/notifications/faculty/notifications');
        return response.data || [];
    },

    // Student APIs
    async getStudentNotifications(): Promise<Notification[]> {
        const response = await apiRequest('/notifications/my-notifications');
        return response.data?.notifications || [];
    },

    async getStudentCirculars(): Promise<Notification[]> {
        const response = await apiRequest('/notifications/my-notifications?type=CIRCULAR');
        return response.data?.notifications || [];
    },

    async getStudentEvents(): Promise<Notification[]> {
        const response = await apiRequest('/notifications/my-notifications?type=EVENT');
        return response.data?.notifications || [];
    },

    async markAsRead(notificationIds: number[]): Promise<void> {
        await apiRequest('/notifications/mark-read', {
            method: 'PUT',
            body: JSON.stringify({ notificationIds }),
        });
    },
};

// Syllabus APIs
export const syllabusAPI = {
    // HOD APIs
    async createSyllabusStructure(subjectId: number, units: any[]): Promise<void> {
        await apiRequest(`/syllabus/hod/subjects/${subjectId}/syllabus`, {
            method: 'POST',
            body: JSON.stringify({ units }),
        });
    },

    async getHODSyllabusProgress(filters?: {
        subjectId?: number;
        batchId?: number;
    }): Promise<SyllabusProgress[]> {
        const queryParams = new URLSearchParams();
        if (filters?.subjectId) queryParams.append('subjectId', filters.subjectId.toString());
        if (filters?.batchId) queryParams.append('batchId', filters.batchId.toString());

        const response = await apiRequest(`/syllabus/hod/syllabus-progress?${queryParams}`);
        return response.data || [];
    },

    // Faculty APIs
    async getFacultySyllabus(): Promise<any[]> {
        const response = await apiRequest('/syllabus/faculty/my-syllabus');
        return response.data || [];
    },

    async updateSyllabusProgress(progressData: {
        batchId: number;
        subjectId: number;
        unitId: number;
        status?: string;
        completionPercent?: number;
        notes?: string;
        topicProgress?: any[];
    }): Promise<void> {
        await apiRequest('/syllabus/faculty/syllabus-progress', {
            method: 'PUT',
            body: JSON.stringify(progressData),
        });
    },

    async getDetailedProgress(subjectId: number, batchId: number): Promise<any> {
        const response = await apiRequest(`/syllabus/faculty/syllabus-progress/${subjectId}/${batchId}`);
        return response.data;
    },

    // Student APIs
    async getStudentSyllabus(): Promise<{
        batch: any;
        subjects: SyllabusSubject[];
    }> {
        const response = await apiRequest('/syllabus/student/my-syllabus');
        return response.data || { batch: null, subjects: [] };
    },

    async getSubjectSyllabus(subjectId: number): Promise<SyllabusSubject> {
        const response = await apiRequest(`/syllabus/student/syllabus/${subjectId}`);
        return response.data;
    },
};

// Authentication helper
export const authAPI = {
    async checkAuthToken(): Promise<{ hasToken: boolean; tokenType?: string }> {
        const token = await getAuthToken();
        if (!token) {
            return { hasToken: false };
        }
        
        // Determine token type
        const tokenKeys = ['loginToken', 'hodToken', 'facultyToken'];
        for (const key of tokenKeys) {
            try {
                const storedToken = await SecureStore.getItemAsync(key);
                if (storedToken === token) {
                    return { 
                        hasToken: true, 
                        tokenType: key.replace('Token', '') 
                    };
                }
            } catch (error) {
                continue;
            }
        }
        
        return { hasToken: true };
    },

    async clearAllTokens(): Promise<void> {
        const tokenKeys = ['loginToken', 'hodToken', 'facultyToken', 'token'];
        for (const key of tokenKeys) {
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (error) {
                console.warn(`Error clearing ${key}:`, error);
            }
        }
    }
};

// Student APIs
export const studentAPI = {
    async getSchedule(): Promise<any[]> {
        const response = await apiRequest('/student/view-schedule');
        return response.data || [];
    },
};