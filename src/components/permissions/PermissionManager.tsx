import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { Permission, PERMISSION_DESCRIPTIONS } from '@/types/permission';
import { permissionService } from '@/services/permissionService';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionManagerProps {
    roleName: string;
    onUpdate?: () => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ roleName, onUpdate }) => {
    const { hasPermission } = usePermissions();
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadPermissions();
    }, [roleName]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const permissions = await permissionService.getUserPermissions(0); // TODO: Get role permissions
            setSelectedPermissions(permissions);
            setError(null);
        } catch (err) {
            setError('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (permission: Permission) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permission)) {
                return prev.filter(p => p !== permission);
            } else {
                return [...prev, permission];
            }
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await permissionService.assignPermissionsToRole(roleName, selectedPermissions);
            setSuccess('Permissions updated successfully');
            onUpdate?.();
        } catch (err) {
            setError('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Manage Permissions for {roleName}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {Object.values(Permission).map((permission) => (
                        <Grid item xs={12} sm={6} md={4} key={permission}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedPermissions.includes(permission)}
                                        onChange={() => handlePermissionChange(permission)}
                                        disabled={!hasPermission(Permission.USER_UPDATE)}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2">
                                            {permission}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {PERMISSION_DESCRIPTIONS[permission]}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    ))}
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={!hasPermission(Permission.USER_UPDATE)}
                    >
                        Save Permissions
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}; 