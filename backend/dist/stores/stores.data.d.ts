export interface Store {
    code: string;
    name: string;
}
export declare const stores: Store[];
export declare const storeMap: Record<string, Store>;
export declare function addStore(code: string, name: string): Store;
export declare function deleteStore(code: string): {
    deleted: boolean;
};
