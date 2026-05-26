import { axiosInstance } from '@app/lib/axiosInstance';

export interface ProvisionalIsrcResponse {
    isrc: string;
    isProvisional: true;
}

export const rightsService = {
    /**
     * Request a provisional ISRC code from the backend. Used when the
     * artist does not yet have an official ISRC. The returned code uses
     * the Muxify registrant prefix and is monotonically issued.
     */
    generateProvisionalIsrc: async (): Promise<ProvisionalIsrcResponse> => {
        const response = await axiosInstance.post<ProvisionalIsrcResponse>(
            '/releases/provisional-isrc',
        );
        return response.data;
    },
};
