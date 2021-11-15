/**
 * Generates action namespace for current duck.
 * @param reducerName Reducer name.
 */
export const getDuckActionNamespace = (reducerName: string): string => `main/${reducerName}`;
