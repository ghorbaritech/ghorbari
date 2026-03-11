import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';

const project = process.env.GOOGLE_CLOUD_PROJECT || 'ghorbari-platform';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const apiEndpoint = `${location}-aiplatform.googleapis.com`;
const publisher = 'google';
const model = 'imagen-3.0-generate-001'; // or specific version

const clientOptions = {
    apiEndpoint: apiEndpoint,
};

const predictionServiceClient = new PredictionServiceClient(clientOptions);

export async function generateImagen3(prompt: string, designType: 'interior' | 'exterior') {
    const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

    const instance = {
        prompt: prompt,
    };

    const instanceValue = helpers.toValue(instance);
    const instances = [instanceValue!];

    const parameter = {
        sampleCount: 1,
        // Optional parameters
        aspectRatio: '1:1',
        addWatermark: false,
    };

    const parameters = helpers.toValue(parameter);

    try {
        const [response] = await predictionServiceClient.predict({
            endpoint,
            instances,
            parameters,
        });

        if (!response.predictions || response.predictions.length === 0) {
            throw new Error('No predictions returned from Vertex AI');
        }

        // The response format for Imagen 3 returns base64 image data
        const prediction = response.predictions[0] as any;
        const base64Image = prediction.structValue?.fields?.bytesBase64Encoded?.stringValue;

        if (!base64Image) {
            throw new Error('Image data not found in prediction response');
        }

        return base64Image;
    } catch (error) {
        console.error('Vertex AI Imagen 3 Error:', error);
        throw error;
    }
}
