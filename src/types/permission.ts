export enum Permission {
    // User Management
    USER_READ = 'USER_READ',
    USER_CREATE = 'USER_CREATE',
    USER_UPDATE = 'USER_UPDATE',
    USER_DELETE = 'USER_DELETE',

    // Role Management
    ROLE_READ = 'ROLE_READ',
    ROLE_CREATE = 'ROLE_CREATE',
    ROLE_UPDATE = 'ROLE_UPDATE',
    ROLE_DELETE = 'ROLE_DELETE',

    // Store Management
    STORE_READ = 'STORE_READ',
    STORE_CREATE = 'STORE_CREATE',
    STORE_UPDATE = 'STORE_UPDATE',
    STORE_DELETE = 'STORE_DELETE',

    // Product Management
    PRODUCT_READ = 'PRODUCT_READ',
    PRODUCT_CREATE = 'PRODUCT_CREATE',
    PRODUCT_UPDATE = 'PRODUCT_UPDATE',
    PRODUCT_DELETE = 'PRODUCT_DELETE',

    // Order Management
    ORDER_READ = 'ORDER_READ',
    ORDER_CREATE = 'ORDER_CREATE',
    ORDER_UPDATE = 'ORDER_UPDATE',
    ORDER_DELETE = 'ORDER_DELETE',

    // Analytics
    ANALYTICS_READ = 'ANALYTICS_READ',
    ANALYTICS_EXPORT = 'ANALYTICS_EXPORT',

    // Discount Management
    DISCOUNT_READ = 'DISCOUNT_READ',
    DISCOUNT_CREATE = 'DISCOUNT_CREATE',
    DISCOUNT_UPDATE = 'DISCOUNT_UPDATE',
    DISCOUNT_DELETE = 'DISCOUNT_DELETE',

    // Review Management
    REVIEW_READ = 'REVIEW_READ',
    REVIEW_CREATE = 'REVIEW_CREATE',
    REVIEW_UPDATE = 'REVIEW_UPDATE',
    REVIEW_DELETE = 'REVIEW_DELETE',

    // System Settings
    SETTINGS_READ = 'SETTINGS_READ',
    SETTINGS_UPDATE = 'SETTINGS_UPDATE',
}

export interface PermissionDescription {
    permission: Permission;
    description: string;
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
    // User Management
    [Permission.USER_READ]: 'Просмотр списка пользователей и их профилей',
    [Permission.USER_CREATE]: 'Создание новых пользователей',
    [Permission.USER_UPDATE]: 'Редактирование данных пользователей',
    [Permission.USER_DELETE]: 'Удаление пользователей',

    // Role Management
    [Permission.ROLE_READ]: 'Просмотр списка ролей и их прав',
    [Permission.ROLE_CREATE]: 'Создание новых ролей',
    [Permission.ROLE_UPDATE]: 'Редактирование прав ролей',
    [Permission.ROLE_DELETE]: 'Удаление ролей',

    // Store Management
    [Permission.STORE_READ]: 'Просмотр списка магазинов и их деталей',
    [Permission.STORE_CREATE]: 'Создание новых магазинов',
    [Permission.STORE_UPDATE]: 'Редактирование данных магазинов',
    [Permission.STORE_DELETE]: 'Удаление магазинов',

    // Product Management
    [Permission.PRODUCT_READ]: 'Просмотр списка продуктов и их деталей',
    [Permission.PRODUCT_CREATE]: 'Создание новых продуктов',
    [Permission.PRODUCT_UPDATE]: 'Редактирование данных продуктов',
    [Permission.PRODUCT_DELETE]: 'Удаление продуктов',

    // Order Management
    [Permission.ORDER_READ]: 'Просмотр списка заказов и их деталей',
    [Permission.ORDER_CREATE]: 'Создание новых заказов',
    [Permission.ORDER_UPDATE]: 'Редактирование статуса заказов',
    [Permission.ORDER_DELETE]: 'Удаление заказов',

    // Analytics
    [Permission.ANALYTICS_READ]: 'Просмотр аналитики и отчетов',
    [Permission.ANALYTICS_EXPORT]: 'Экспорт данных аналитики',

    // Discount Management
    [Permission.DISCOUNT_READ]: 'Просмотр списка скидок',
    [Permission.DISCOUNT_CREATE]: 'Создание новых скидок',
    [Permission.DISCOUNT_UPDATE]: 'Редактирование скидок',
    [Permission.DISCOUNT_DELETE]: 'Удаление скидок',

    // Review Management
    [Permission.REVIEW_READ]: 'Просмотр отзывов',
    [Permission.REVIEW_CREATE]: 'Создание отзывов',
    [Permission.REVIEW_UPDATE]: 'Редактирование отзывов',
    [Permission.REVIEW_DELETE]: 'Удаление отзывов',

    // System Settings
    [Permission.SETTINGS_READ]: 'Просмотр системных настроек',
    [Permission.SETTINGS_UPDATE]: 'Изменение системных настроек',
}; 