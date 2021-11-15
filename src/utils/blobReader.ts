/**
 * Read and return content of the blob object.
 *
 * @param blob {Blob} Blob object.
 * @return File content string.
 */
export const blobReader = (blob: Blob): Promise<string> => {
    const fileReader: FileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onerror = () => {
            fileReader.abort();
            reject(new Error('Parsing Blob object error'));
        };

        fileReader.onload = () => {
            resolve(fileReader.result as string);
        };

        fileReader.readAsText(blob);
    });
};
