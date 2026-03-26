import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserRole } from '../../types';

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

import { MainTabScreenProps } from '../../types';

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
    const { user, completeProfile, logout, setRole, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [selectedArea, setSelectedArea] = useState(user?.area || 'Phase 1');

    const handleUpdate = async () => {
        await completeProfile({ name, area: selectedArea });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const handleSwitchRole = (newRole: UserRole) => {
        Alert.alert(
            'Switch Role',
            `Are you sure you want to switch to ${newRole} mode?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Switch',
                    onPress: () => {
                        setRole(newRole);
                        Alert.alert('Role Switched', `You are now in ${newRole} mode.`);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.photoContainer}>
                        <View style={styles.photo}>
                            <MaterialCommunityIcons name="account" size={60} color={COLORS.textSecondary} />
                        </View>
                        <TouchableOpacity style={styles.editPhotoButton}>
                            <MaterialCommunityIcons name="camera" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>{user?.role?.toUpperCase()} • {user?.area}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                            <Text style={styles.editLink}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {isEditing ? (
                        <View style={styles.editForm}>
                            <AppTextInput
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                            />
                            <Text style={styles.label}>Primary Area</Text>
                            <View style={styles.areaContainer}>
                                {AREAS.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[
                                            styles.areaButton,
                                            selectedArea === area && styles.areaButtonActive
                                        ]}
                                        onPress={() => setSelectedArea(area)}
                                    >
                                        <Text style={[
                                            styles.areaButtonText,
                                            selectedArea === area && styles.areaButtonTextActive
                                        ]}>
                                            {area}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <PrimaryButton title="Save Changes" onPress={handleUpdate} />
                        </View>
                    ) : (
                        <View style={styles.infoList}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Location</Text>
                                    <Text style={styles.infoValue}>{user?.area}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Switch Mode</Text>
                    <Text style={styles.sectionSubtitle}>Toggle between looking for rooms, work, or hiring</Text>

                    <View style={styles.roleGrid}>
                        <RoleToggle
                            active={user?.role === 'tenant'}
                            label="Room Seeker"
                            icon="home-search"
                            onPress={() => handleSwitchRole('tenant')}
                            color={COLORS.primary}
                        />
                        <RoleToggle
                            active={user?.role === 'worker'}
                            label="Work Seeker"
                            icon="briefcase-search"
                            onPress={() => handleSwitchRole('worker')}
                            color={COLORS.success}
                        />
                        <RoleToggle
                            active={user?.role === 'employer'}
                            label="Employer"
                            icon="account-hard-hat"
                            onPress={() => handleSwitchRole('employer')}
                            color={COLORS.secondary}
                        />
                    </View>
                </View>
                {user?.role === 'worker' && (
                    <View style={styles.section}>
                        <View style={styles.switchRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Availability Status</Text>
                                <Text style={styles.sectionSubtitle}>Are you currently open for new work?</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.customSwitch,
                                    user?.availability === 'Available' ? styles.switchOn : styles.switchOff
                                ]}
                                onPress={() => {
                                    const newStatus = user?.availability === 'Available' ? 'Busy' : 'Available';
                                    updateProfile({ availability: newStatus });
                                }}
                            >
                                <View style={[
                                    styles.switchHandle,
                                    user?.availability === 'Available' ? styles.handleRight : styles.handleLeft
                                ]} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md }} />

                        <TouchableOpacity 
                            style={styles.manageBtn}
                            onPress={() => navigation.navigate('CreateServiceProfile')}
                        >
                            <MaterialCommunityIcons name="account-tie-outline" size={24} color={COLORS.primary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.manageTitle}>Professional Profile</Text>
                                <Text style={styles.manageSub}>Update your skills, experience and rates</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {user?.role === 'employer' && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.manageBtn}
                            onPress={() => navigation.navigate('PostListing')}
                        >
                            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={COLORS.primary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.manageTitle}>Post New Listing</Text>
                                <Text style={styles.manageSub}>Create a new Property or Job post</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md }} />

                        <TouchableOpacity
                            style={styles.manageBtn}
                            onPress={() => navigation.navigate('ManagePosts')}
                        >
                            <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={COLORS.primary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.manageTitle}>Manage My Postings</Text>
                                <Text style={styles.manageSub}>View and edit your live listings</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <MaterialCommunityIcons name="logout" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const RoleToggle = ({ active, label, icon, onPress, color }: any) => (
    <TouchableOpacity
        style={[
            styles.roleButton,
            active && { borderColor: color, backgroundColor: color + '10' }
        ]}
        onPress={onPress}
    >
        <MaterialCommunityIcons name={icon} size={28} color={active ? color : COLORS.textSecondary} />
        <Text style={[styles.roleLabel, active && { color: color, fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: COLORS.white,
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    userRole: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: '600',
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.light,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    editLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    editForm: {
        marginTop: SPACING.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    infoList: {
        gap: SPACING.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoTextContainer: {
        marginLeft: SPACING.md,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    areaContainer: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.lg,
    },
    areaButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    areaButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    areaButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    areaButtonTextActive: {
        color: COLORS.white,
    },
    roleGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    roleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    roleLabel: {
        fontSize: 12,
        marginTop: 8,
        color: COLORS.textSecondary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: '700',
        marginLeft: SPACING.sm,
    },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    manageTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    manageSub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    managePostsButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customSwitch: {
        width: 60,
        height: 32,
        borderRadius: 16,
        padding: 4,
        justifyContent: 'center',
    },
    switchOn: {
        backgroundColor: COLORS.success,
    },
    switchOff: {
        backgroundColor: COLORS.border,
    },
    switchHandle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    },
    handleLeft: {
        alignSelf: 'flex-start',
    },
    handleRight: {
        alignSelf: 'flex-end',
    }
});
