export function getBase64(file: File, callback: (result: string) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        const result = reader.result;
        if (typeof result === 'string') {
            callback(result);
        } else {
            throw new Error('Failed to convert file to Base64 format');
        }
    });
    reader.readAsDataURL(file);
}
