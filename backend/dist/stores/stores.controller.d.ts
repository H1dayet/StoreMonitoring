export declare class StoresController {
    findAll(): import("./stores.data").Store[];
    create(body: {
        code?: string | number;
        name?: string;
    }): import("./stores.data").Store;
    remove(code: string): {
        deleted: boolean;
    };
}
