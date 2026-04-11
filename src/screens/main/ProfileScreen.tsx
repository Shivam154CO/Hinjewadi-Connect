import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Alert, Switch
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
    const { user, logout, setRole, completeProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [selectedArea, setSelectedArea] = useState(user?.area || 'Phase 1');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const initial = user?.name?.charAt(0).toUpperCase() || 'U';
    const roleLabel = user?.role === 'employer' ? 'Employer' : user?.role === 'worker' ? 'Worker' : 'Seeker';

    const handleUpdate = async () => {
        try { setLoading(true); await completeProfile({ name, area: selectedArea }); setIsEditing(false); }
        catch { Alert.alert('Error', 'Update failed'); }
        finally { setLoading(false); }
    };

    const switchRole = (r: UserRole) =>
        Alert.alert('Switch Mode', 'Change your role?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Switch', onPress: () => setRole(r) },
        ]);

    return (
        <View style={s.root}>
            <SafeAreaView edges={['top']} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ── Title bar ── */}
                <View style={s.topBar}>
                    <Text style={s.screenTitle}>Profile</Text>
                </View>

                {/* ── Hero card ── */}
                <View style={s.heroCard}>
                    <View style={s.heroAvatarWrap}>
                        <View style={s.heroAvatar}>
                            <Text style={s.heroInitial}>{initial}</Text>
                        </View>
                        <View style={s.onlineDot} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={s.heroName}>{user?.name || 'Your Name'}</Text>
                        <Text style={s.heroSub}>{user?.email || 'Hinjewadi Connect'}</Text>
                        <View style={s.heroBadgeRow}>
                            <View style={s.heroBadge}>
                                <MaterialCommunityIcons name="map-marker" size={10} color="#00C896" />
                                <Text style={s.heroBadgeText}>{user?.area || '—'}</Text>
                            </View>
                            <View style={[s.heroBadge, { backgroundColor: '#007AFF20' }]}>
                                <Text style={[s.heroBadgeText, { color: '#007AFF' }]}>{roleLabel}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={s.editHeroBtn} onPress={() => setIsEditing(!isEditing)}>
                        <MaterialCommunityIcons name={isEditing ? 'close' : 'pencil-outline'} size={18} color="#00C896" />
                    </TouchableOpacity>
                </View>

                {/* ── Edit Form ── */}
                {isEditing && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Edit Profile</Text>
                        <AppTextInput label="Name" value={name} onChangeText={setName} placeholder="Your name" />
                        <Text style={s.fieldLabel}>Area</Text>
                        <View style={s.areaRow}>
                            {AREAS.map(a => (
                                <TouchableOpacity
                                    key={a} style={[s.areaChip, selectedArea === a && s.areaChipOn]}
                                    onPress={() => setSelectedArea(a)}
                                >
                                    <Text style={[s.areaChipText, selectedArea === a && s.areaChipTextOn]}>{a}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={s.editBtns}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setIsEditing(false)}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleUpdate} disabled={loading}>
                                <Text style={s.saveText}>{loading ? 'Saving…' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ── Mode / Role ── */}
                <Text style={s.groupLabel}>ACTIVE MODE</Text>
                <View style={s.card}>
                    {[
                        { role: 'tenant' as UserRole, label: 'Looking for Room / Job', icon: 'account-search-outline', color: '#007AFF' },
                        { role: 'worker' as UserRole, label: 'Offering Services / Work', icon: 'briefcase-outline', color: '#00C896' },
                        { role: 'employer' as UserRole, label: 'Hiring / Posting Listings', icon: 'office-building-outline', color: '#FF9500' },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.role}>
                            <TouchableOpacity style={s.row} onPress={() => switchRole(item.role)} activeOpacity={0.7}>
                                <View style={[s.rowIcon, { backgroundColor: item.color + '25' }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                                </View>
                                <Text style={s.rowLabel}>{item.label}</Text>
                                {user?.role === item.role
                                    ? <MaterialCommunityIcons name="check-circle" size={20} color="#00C896" />
                                    : <MaterialCommunityIcons name="chevron-right" size={20} color="#3A3A3C" />
                                }
                            </TouchableOpacity>
                            {i < arr.length - 1 && <View style={s.sep} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* ── Settings ── */}
                <Text style={s.groupLabel}>SETTINGS</Text>
                <View style={s.card}>
                    <View style={s.row}>
                        <View style={[s.rowIcon, { backgroundColor: '#FF453A25' }]}>
                            <MaterialCommunityIcons name="bell-outline" size={18} color="#FF453A" />
                        </View>
                        <Text style={s.rowLabel}>Notifications</Text>
                        <Switch value={notifications} onValueChange={setNotifications}
                            trackColor={{ true: '#00C896', false: '#3A3A3C' }}
                            thumbColor="#FFFFFF" />
                    </View>
                    <View style={s.sep} />
                    <SettingsRow icon="translate" color="#5856D6" label="Language"
                        value={i18n.language.toUpperCase()} />
                    <View style={s.sep} />
                    {user?.role === 'worker' && (
                        <>
                            <SettingsRow icon="account-tie-outline" color="#007AFF"
                                label="Professional Profile"
                                onPress={() => navigation.navigate('CreateServiceProfile')} />
                            <View style={s.sep} />
                        </>
                    )}
                    {user?.role === 'employer' && (
                        <>
                            <SettingsRow icon="plus-circle-outline" color="#007AFF"
                                label="Post New Listing" onPress={() => navigation.navigate('PostListing')} />
                            <View style={s.sep} />
                            <SettingsRow icon="clipboard-list-outline" color="#5856D6"
                                label="Manage My Posts" onPress={() => navigation.navigate('ManagePosts')} />
                            <View style={s.sep} />
                        </>
                    )}
                    <SettingsRow icon="shield-check-outline" color="#00C896" label="Legal & Privacy"
                        onPress={() => (navigation as any).navigate('Legal')} />
                    <View style={s.sep} />
                    <SettingsRow icon="help-circle-outline" color="#636366" label="Help & Support"
                        onPress={() => (navigation as any).navigate('HelpSupport')} />
                </View>

                {/* ── Sign Out ── */}
                <TouchableOpacity style={s.logoutCard} onPress={logout} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="logout-variant" size={18} color="#FF453A" />
                    <Text style={s.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={s.version}>Hinjewadi Connect v1.2.5</Text>
                <View style={{ height: 110 }} />
            </ScrollView>
        </View>
    );
};

const SettingsRow = ({ icon, color, label, value, onPress }: {
    icon: any; color: string; label: string; value?: string; onPress?: () => void;
}) => (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
        <View style={[s.rowIcon, { backgroundColor: color + '25' }]}>
            <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <Text style={s.rowLabel}>{label}</Text>
        {value ? <Text style={s.rowValue}>{value}</Text> : onPress ? <MaterialCommunityIcons name="chevron-right" size={20} color="#3A3A3C" /> : null}
    </TouchableOpacity>
);

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F0F0F' },
    scroll: { paddingHorizontal: 20 },
    topBar: { paddingTop: 12, paddingBottom: 8 },
    screenTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },

    // Hero card
    heroCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1E', borderRadius: 22, padding: 16,
        marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
    },
    heroAvatarWrap: { position: 'relative' },
    heroAvatar: {
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
    },
    heroInitial: { fontSize: 26, fontWeight: '700', color: '#000000' },
    onlineDot: {
        position: 'absolute', bottom: 2, right: 2,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#30D158', borderWidth: 2, borderColor: '#1C1C1E',
    },
    heroName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    heroSub: { fontSize: 12, color: '#636366', marginTop: 2 },
    heroBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
    heroBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#00C89620', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 20,
    },
    heroBadgeText: { fontSize: 11, color: '#00C896', fontWeight: '600' },
    editHeroBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: '#00C89615', alignItems: 'center', justifyContent: 'center',
    },

    // Edit form
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#AEAEB2', marginBottom: 8 },
    areaRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    areaChip: {
        flex: 1, paddingVertical: 10, borderRadius: 12,
        backgroundColor: '#2C2C2E', alignItems: 'center',
    },
    areaChipOn: { backgroundColor: '#00C896' },
    areaChipText: { fontSize: 13, fontWeight: '600', color: '#636366' },
    areaChipTextOn: { color: '#000000' },
    editBtns: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
        flex: 1, paddingVertical: 13, backgroundColor: '#2C2C2E',
        borderRadius: 14, alignItems: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: '#636366' },
    saveBtn: {
        flex: 2, paddingVertical: 13, backgroundColor: '#00C896',
        borderRadius: 14, alignItems: 'center',
    },
    saveText: { fontSize: 15, fontWeight: '700', color: '#000000' },

    // Groups & Cards
    groupLabel: {
        fontSize: 11, fontWeight: '700', color: '#636366',
        letterSpacing: 1, marginBottom: 10, marginLeft: 4,
    },
    card: {
        backgroundColor: '#1C1C1E', borderRadius: 20,
        marginBottom: 24, overflow: 'hidden',
        padding: 4,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16, paddingHorizontal: 12, paddingTop: 8 },

    // Rows
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 13, paddingHorizontal: 12, minHeight: 50,
    },
    rowIcon: {
        width: 34, height: 34, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    rowLabel: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '400' },
    rowValue: { fontSize: 14, color: '#636366' },
    sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 60 },

    // Logout
    logoutCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FF453A15', borderRadius: 16, paddingVertical: 16, gap: 8,
        borderWidth: 1, borderColor: '#FF453A25', marginBottom: 20,
    },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#FF453A' },
    version: { fontSize: 12, color: '#3A3A3C', textAlign: 'center' },
});
