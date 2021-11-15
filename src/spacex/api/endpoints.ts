/**
 * Api endpoints.
 */
export const endpoints = {
    companies: {
        base: '/companies',
        get details(): string {
            return `${this.base}`;
        },
    },
};
