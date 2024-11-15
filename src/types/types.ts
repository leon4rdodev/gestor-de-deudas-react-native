export interface Transaction {
    date: string;
    amount: number;
    type: string;
}

export interface Client {
    id: string;
    name: string;
    debt: number;
    phone?: string;
    transactions: Transaction[];
}