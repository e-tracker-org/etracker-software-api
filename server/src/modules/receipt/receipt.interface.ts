export interface ReceiptCategory{
    name: string;
    description: string
}

export interface TransactionInfo {
    category: string;
    dueDate: string;
    amount: string;
    description: string;
    recipients: string[]
}
