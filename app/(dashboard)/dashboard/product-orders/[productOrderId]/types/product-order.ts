export function getStatusVariant(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-red-50 text-red-500';
        case 'waiting':
            return 'bg-yellow-50 text-yellow-500';
        case 'partially paid':
            return 'bg-yellow-50 text-yellow-500';
        case 'confirmed':
            return 'bg-orange-50 text-orange-500';
        case 'on_going':
            return 'bg-blue-50 text-blue-500';
        case 'on_progress':
            return 'bg-blue-50 text-blue-500';
        case 'done':
            return 'bg-green-50 text-green-500';
        case 'rejected':
            return 'bg-red-50 text-red-500';
        case 'failed':
            return 'bg-gray-50 text-gray-500';
        case 'accepted':
            return 'bg-green-50 text-green-500';
        default:
            return '';
    }
}


export enum ProductOrderStatus {
    PENDING = 'pending',
    WAITING = 'waiting',
    CONFIRMED = 'confirmed',
    ON_GOING = 'on_going',
    ON_PROGRESS = 'on_progress',
    DONE = 'done',
    ACCEPTED = 'accepted',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PARTIALLY_PAID = 'partially paid',
    DONE = 'done',
    FAILED = 'failed',
}

export function getPaymentStatusLabel(payment_status: string): string {
    switch (payment_status) {
        case PaymentStatus.PENDING:
            return 'Belum Dibayar';
        case PaymentStatus.DONE:
            return 'Lunas';
        case PaymentStatus.PARTIALLY_PAID:
            return 'Kurang Bayar';
        case PaymentStatus.FAILED:
            return 'Gagal';
        default:
            return ''
    }
}

export enum ProductCategory {
    IPHONE = 'iphone',
    CAMERA = 'camera',
    OUTDOOR = 'outdoor',
    STARLINK = 'starlink',
}

export function getCategoryLabel(category: string): string {
    switch (category) {
        case 'iphone':
            return 'iPhone';
        case 'camera':
            return 'Camera';
        case 'outdoor':
            return 'Outdoor';
        case 'starlink':
            return 'Starlink';
        default:
            return category;
    }
}

export function getProductStatusLabel(status: string): string {
    switch (status) {
        case 'available':
            return 'Tersedia';
        case 'unavailable':
            return 'Tidak Tersedia';
        default:
            return status;
    }
}

    
export interface ProductOrder {
    id: number;
    created_at: string;
    updated_at: string;
    invoice_number: string;
    description: string;
    customer_id: string;
    start_date: string;
    duration: number;
    payment_status: string;
    status: string;
    service_price: number;
    out_of_town_price: number;
    additional_services: Array<{
        name: string;
        price: number;
    }>;
    driver_price: number;
    sub_total_price: number;
    total_tax: number;
    discount: number;
    total_price: number;
    payment_link: string;
    payment_pdf_url: string;
    external_id: string;
    is_extended: boolean;
    customer: {
        id: number;
        created_at: string;
        updated_at: string;
        name: string;
        email: string;
        phone_number: string;
        role: string;
        emergency_phone_number: string | null;
        status: string;
        additional_data_status: string;
        status_login: boolean;
        id_cards: any[];
        additional_data: any[];
    };
    fleet: any | null;
    product: {
        id: number;
        created_at: string;
        updated_at: string;
        slug: string;
        name: string;
        category: string;
        model: string;
        price: number;
        status: string;
        specifications: {
            color: string;
            storage: string;
            battery_level: number;
        };
        location_id: string;
        location: {
            id: number;
            created_at: string;
            updated_at: string;
            name: string;
            location: string;
            address: string;
            map_url: string;
            redirect_url: string;
        };
        photo: {
            id: number;
            created_at: string;
            updated_at: string;
            photo: string;
        };
        photos: Array<{
            id: number;
            created_at: string;
            updated_at: string;
            photo: string;
        }>;
        category_label: string;
        status_label: string;
    };
    insurance: {
        id: number;
        created_at: string;
        updated_at: string;
        code: string;
        name: string;
        description: string;
        price: number;
    };
    status_logs: Array<{
        id: number;
        created_at: string;
        updated_at: string;
        order_id: string;
        status: string;
        description: string | null;
    }>;
    discount_amount: number;
    start_request: {
        id: number;
        created_at: string;
        updated_at: string;
        driver_id: string;
        customer_id: string | null;
        start_date: string | null;
        type: string;
        status: string;
        is_self_pickup: boolean;
        description: string | null;
        address: string;
        distance: number;
        driver: {
            id: number;
            created_at: string;
            updated_at: string;
            name: string;
            phone_number: string | null;
            role: string;
            status: string;
            additional_data_status: string;
            status_login: boolean;
        };
        customer: any | null;
        logs: any[];
        is_end_process: boolean;
        progress_duration_second: number | null;
    };
    end_request: {
        id: number;
        created_at: string;
        updated_at: string;
        driver_id: string;
        customer_id: string | null;
        start_date: string | null;
        type: string;
        status: string;
        is_self_pickup: boolean;
        description: string | null;
        address: string;
        distance: number;
        driver: {
            id: number;
            created_at: string;
            updated_at: string;
            name: string;
            phone_number: string | null;
            role: string;
            status: string;
            additional_data_status: string;
            status_login: boolean;
        };
        customer: any | null;
        logs: any[];
        is_end_process: boolean;
        progress_duration_second: number | null;
    };
    request_status: string;
    end_date: string;
    is_out_of_town: boolean;
    is_with_driver: boolean;
    order_status: string;
    order_status_text: string;
}