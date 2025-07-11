import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Permission } from '@/types/permission';

// ... existing code ...

// Add this inside the menu items array
{
    title: 'Permissions',
    path: '/permissions',
    icon: <SecurityIcon />,
    component: (
        <PermissionGuard permission={Permission.USER_UPDATE}>
            <ListItemButton component={Link} href="/permissions">
                <ListItemIcon>
                    <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Permissions" />
            </ListItemButton>
        </PermissionGuard>
    )
},
// ... existing code ... 