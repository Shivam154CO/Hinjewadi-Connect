import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/AppTextInput';
import { UserRole, MainTabScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const { user, completeProfile, logout, setRole, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [selectedArea, setSelectedArea] = useState(user?.area || 'Phase 1');
    const [loading, setLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await completeProfile({ name, area: selectedArea });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated');
        } catch {
            Alert.alert('Error', 'Update failed, try again');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchRole = (newRole: UserRole) => {
        Alert.alert('Switch Mode', 'Change your role on the platform?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Switch', onPress: () => setRole(newRole) },
        ]);
    };

    const roleLabel = user?.role === 'employer' ? 'Employer' : user?.role === 'worker' ? 'Worker' : 'Seeker';
    const initial = user?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <View style={styles.root}>
            <SafeAreaView edges={['top']} style={styles.safeTop} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Hero Avatar Block ── */}
                <View style={styles.heroBlock}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                    </View>
                    <Text style={styles.heroName}>{user?.name || 'Your Name'}</Text>
                    <View style={styles.heroPillRow}>
                        <View style={styles.heroPill}>
                            <MaterialCommunityIcons name="map-marker" size={12} color="#007AFF" />
                            <Text style={styles.heroPillText}>{user?.area || 'Hinjewadi'}</Text>
                        </View>
                        <View style={[styles.heroPill, styles.heroPillRole]}>
                            <Text style={styles.heroPillRoleText}>{roleLabel}</Text>
                        </View>
                    </View>
                    {!isEditing && (
                        <TouchableOpacity style={styles.heroEditBtn} onPress={() => setIsEditing(true)}>
                            <Text style={styles.heroEditBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Edit Form ── */}
                {isEditing && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>EDIT PROFILE</Text>
                        <View style={styles.card}>
                            <AppTextInput
                                label="Name"
                                value={name}
                                onChangeText={setName}
                                placeholder="Your name"
                            />
                            <Text style={styles.fieldLabel}>Area</Text>
                            <View style={styles.areaRow}>
                                {AREAS.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[styles.areaChip, selectedArea === area && styles.areaChipActive]}
                                        onPress={() => setSelectedArea(area)}
                                    >
                                        <Text style={[styles.areaChipText, selectedArea === area && styles.areaChipTextActive]}>
                                            {area}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.editBtnRow}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                                    <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Account Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT</Text>
                    <View style={styles.card}>
                        <SettingsRow
                            icon="account-outline" iconBg="#007AFF"
                            label="Full Name" value={user?.name || '—'}
                            onPress={() => setIsEditing(true)}
                        />
                        <Separator />
                        <SettingsRow
                            icon="map-marker-outline" iconBg="#34C759"
                            label="Location" value={user?.area || '—'}
                            onPress={() => setIsEditing(true)}
                        />
                        <Separator />
                        <SettingsRow
                            icon="shield-check-outline" iconBg="#5856D6"
                            label="Account Status" value="Verified"
                        />
                    </View>
                </View>

                {/* ── Role Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACTIVE MODE</Text>
                    <View style={styles.card}>
                        <RoleRow
                            label="Looking for Room / Job"
                            iconBg="#007AFF" icon="account-search-outline"
                            active={user?.role === 'tenant'}
                            onPress={() => handleSwitchRole('tenant')}
                        />
                        <Separator />
                        <RoleRow
                            label="Offering Services / Work"
                            iconBg="#34C759" icon="briefcase-outline"
                            active={user?.role === 'worker'}
                            onPress={() => handleSwitchRole('worker')}
                        />
                        <Separator />
                        <RoleRow
                            label="Hiring / Posting Listings"
                            iconBg="#FF9500" icon="office-building-outline"
                            active={user?.role === 'employer'}
                            onPress={() => handleSwitchRole('employer')}
                        />
                    </View>
                </View>

                {/* ── Language ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>LANGUAGE</Text>
                    <View style={styles.card}>
                        {[
                            { code: 'en', label: 'English' },
                            { code: 'hi', label: 'हिंदी' },
                            { code: 'mr', label: 'मराठी' },
                        ].map((lang, idx, arr) => (
                            <React.Fragment key={lang.code}>
                                <TouchableOpacity
                                    style={styles.settingsRow}
                                    onPress={() => i18n.changeLanguage(lang.code)}
                                >
                                    <Text style={styles.rowLabel}>{lang.label}</Text>
                                    {i18n.language === lang.code && (
                                        <MaterialCommunityIcons name="check" size={18} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                                {idx < arr.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* ── More Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>MORE</Text>
                    <View style={styles.card}>
                        <SettingsRow
                            icon="bell-outline" iconBg="#FF3B30"
                            label="Notifications"
                            trailing={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ true: '#34C759', false: '#E5E5EA' }}
                                    thumbColor="#FFFFFF"
                                />
                            }
                        />
                        <Separator />
                        {user?.role === 'worker' && (
                            <>
                                <SettingsRow
                                    icon="account-tie-outline" iconBg="#5856D6"
                                    label="Professional Profile"
                                    onPress={() => navigation.navigate('CreateServiceProfile')}
                                />
                                <Separator />
                            </>
                        )}
                        {user?.role === 'employer' && (
                            <>
                                <SettingsRow
                                    icon="plus-circle-outline" iconBg="#007AFF"
                                    label="Post New Listing"
                                    onPress={() => navigation.navigate('PostListing')}
                                />
                                <Separator />
                                <SettingsRow
                                    icon="clipboard-list-outline" iconBg="#5856D6"
                                    label="Manage My Posts"
                                    onPress={() => navigation.navigate('ManagePosts')}
                                />
                                <Separator />
                            </>
                        )}
                        <SettingsRow
                            icon="shield-check-outline" iconBg="#34C759"
                            label="Legal & Privacy"
                            onPress={() => (navigation as any).navigate('Legal')}
                        />
                        <Separator />
                        <SettingsRow
                            icon="help-circle-outline" iconBg="#8E8E93"
                            label="Help & Support"
                            onPress={() => (navigation as any).navigate('HelpSupport')}
                        />
                    </View>
                </View>

                {/* ── Logout ── */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.settingsRow} onPress={logout}>
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>Hinjewadi Connect v1.2.5</Text>
                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

// ─── Sub-Components ──────────────────────────────────────────

const Separator = () => <View style={styles.separator} />;

const SettingsRow = ({
    icon, iconBg, label, value, onPress, trailing
}: {
    icon: any; iconBg: string; label: string;
    value?: string; onPress?: () => void; trailing?: React.ReactNode;
}) => (
    <TouchableOpacity
        style={styles.settingsRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.6 : 1}
        disabled={!onPress && !trailing}
    >
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={icon} size={17} color="#FFFFFF" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.rowRight}>
            {value && <Text style={styles.rowValue}>{value}</Text>}
            {trailing}
            {onPress && !trailing && (
                <MaterialCommunityIcons name="chevron-right" size={18} color="#C7C7CC" />
            )}
        </View>
    </TouchableOpacity>
);

const RoleRow = ({
    label, icon, iconBg, active, onPress
}: {
    label: string; icon: any; iconBg: string; active: boolean; onPress: () => void;
}) => (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.6}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={icon} size={17} color="#FFFFFF" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.rowRight}>
            {active ? (
                <MaterialCommunityIcons name="check-circle" size={20} color="#007AFF" />
            ) : (
                <MaterialCommunityIcons name="chevron-right" size={18} color="#C7C7CC" />
            )}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F2F7' },
    safeTop: { backgroundColor: '#F2F2F7' },
    scroll: { paddingTop: 0 },

    // Hero
    heroBlock: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 28,
        backgroundColor: '#F2F2F7',
    },
    avatarRing: {
        width: 92, height: 92, borderRadius: 46,
        backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 14,
    },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#007AFF',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 34, fontWeight: '700', color: '#FFFFFF' },
    heroName: { fontSize: 24, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },
    heroPillRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    heroPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#E5F0FF', paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20,
    },
    heroPillText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
    heroPillRole: { backgroundColor: '#E5E5EA' },
    heroPillRoleText: { fontSize: 12, color: '#6B6B73', fontWeight: '600' },
    heroEditBtn: {
        marginTop: 14,
        paddingHorizontal: 28, paddingVertical: 10,
        backgroundColor: '#007AFF', borderRadius: 22,
    },
    heroEditBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

    // Sections
    section: { marginTop: 28, paddingHorizontal: 16 },
    sectionLabel: {
        fontSize: 12, fontWeight: '600', color: '#8E8E93',
        letterSpacing: 0.5, marginBottom: 8, marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E5E5EA',
        marginLeft: 56,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    rowIcon: {
        width: 30, height: 30, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    rowLabel: { flex: 1, fontSize: 16, color: '#000000', fontWeight: '400' },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowValue: { fontSize: 15, color: '#8E8E93' },

    // Edit form
    fieldLabel: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 8, marginTop: 4 },
    areaRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    areaChip: {
        flex: 1, paddingVertical: 9, borderRadius: 10,
        backgroundColor: '#F2F2F7', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E5EA',
    },
    areaChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    areaChipText: { fontSize: 13, fontWeight: '600', color: '#6B6B73' },
    areaChipTextActive: { color: '#FFFFFF' },
    editBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    cancelBtn: {
        flex: 1, paddingVertical: 13, backgroundColor: '#F2F2F7',
        borderRadius: 12, alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
    saveBtn: {
        flex: 2, paddingVertical: 13, backgroundColor: '#007AFF',
        borderRadius: 12, alignItems: 'center',
    },
    saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

    // Logout & misc
    logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '400', textAlign: 'center', flex: 1 },
    versionText: { fontSize: 12, color: '#C7C7CC', textAlign: 'center', marginTop: 20 },
});
