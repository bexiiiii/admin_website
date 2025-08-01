import { axiosInstance } from './api/api';

export interface UploadResponse {
    message: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
}

export interface MultipleUploadResponse {
    uploadedFiles: UploadResponse[];
    successCount: number;
    totalCount: number;
    errors?: string[];
    errorCount?: number;
}

export class FileUploadService {
    private static readonly UPLOAD_ENDPOINT = '/api/upload';

    /**
     * Upload a single image file
     */
    static async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<UploadResponse>(
            `${this.UPLOAD_ENDPOINT}/image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    /**
     * Upload multiple image files
     */
    static async uploadImages(files: File[]): Promise<MultipleUploadResponse> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await axiosInstance.post<MultipleUploadResponse>(
            `${this.UPLOAD_ENDPOINT}/images`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    /**
     * Delete an uploaded image
     */
    static async deleteImage(filename: string): Promise<void> {
        await axiosInstance.delete(`${this.UPLOAD_ENDPOINT}/image`, {
            params: { filename }
        });
    }

    /**
     * Validate file before upload
     */
    static validateImageFile(file: File): string | null {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return 'Размер файла не должен превышать 5MB';
        }

        if (!allowedTypes.includes(file.type.toLowerCase())) {
            return 'Разрешены только изображения (JPEG, PNG, GIF, WebP)';
        }

        return null;
    }

    /**
     * Convert file to base64 (fallback)
     */
    static convertToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
}
