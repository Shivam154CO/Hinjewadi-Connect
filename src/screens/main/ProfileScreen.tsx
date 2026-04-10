import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/AppTextInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserRole, MainTabScreenProps } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { AIInsights } from '../../components/AIInsights';

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];
const LANGUAGES = [
    { code: 'en', label: 'English', icon: 'alphabetical' },
    { code: 'hi', label: 'हिंदी', icon: 'translate' },
    { code: 'mr', label: 'मराठी', icon: 'script-text' },
];

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const { user, completeProfile, logout, setRole, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [selectedArea, setSelectedArea] = useState(user?.area || 'Phase 1');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await completeProfile({ name, area: selectedArea });
            setIsEditing(false);
            Alert.alert(t('success'), t('profile_updated'));
        } catch (error) {
            Alert.alert(t('error'), t('update_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchRole = (newRole: UserRole) => {
        Alert.alert(
            t('mode_role'),
            t('mode_subtitle'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('continue'),
                    onPress: () => {
                        setRole(newRole);
                    }
                }
            ]
        );
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#3730A3']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarChar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                            </View>
                            <TouchableOpacity style={styles.editAvatarBtn}>
                                <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.userName}>{user?.name}</Text>
                            <Text style={styles.userSub}>{user?.email || 'Hinjewadi Connect User'}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* AI Insights Card */}
                <AIInsights />

                {/* Account Settings Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{t('account_settings')}</Text>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                            <Text style={styles.editAction}>{isEditing ? t('cancel') : t('edit')}</Text>
                        </TouchableOpacity>
                    </View>

                    {isEditing ? (
                        <View style={styles.form}>
                            <AppTextInput
                                label={t('name')}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('name_placeholder')}
                            />
                            <Text style={styles.label}>{t('area')}</Text>
                            <View style={styles.areaGrid}>
                                {AREAS.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[styles.areaChip, selectedArea === area && styles.areaChipActive]}
                                        onPress={() => setSelectedArea(area)}
                                    >
                                        <Text style={[styles.areaText, selectedArea === area && styles.areaTextActive]}>{area}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity 
                                style={styles.saveBtn} 
                                onPress={handleUpdate}
                                disabled={loading}
                            >
                                <Text style={styles.saveBtnText}>{loading ? t('save') + '...' : t('save_changes')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.infoGrid}>
                            <InfoTile 
                                icon="map-marker" 
                                label={t('location')} 
                                value={user?.area || 'Not Set'} 
                                color="#4F46E5"
                            />
                            <InfoTile 
                                icon="shield-account" 
                                label={t('status')} 
                                value={t('verified')} 
                                color="#10B981"
                            />
                        </View>
                    )}
                </View>

                {/* Mode Switcher */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('mode_role')}</Text>
                    <Text style={styles.sectionSubtitle}>{t('mode_subtitle')}</Text>
                </View>

                <View style={styles.roleGrid}>
                    <RoleCard
                        active={user?.role === 'tenant'}
                        label={t('seeker')}
                        subtitle={t('seeker_subtitle')}
                        icon="account-search"
                        onPress={() => handleSwitchRole('tenant')}
                        color="#4F46E5"
                    />
                    <RoleCard
                        active={user?.role === 'worker'}
                        label={t('provider')}
                        subtitle={t('provider_subtitle')}
                        icon="briefcase-check"
                        onPress={() => handleSwitchRole('worker')}
                        color="#10B981"
                    />
                    <RoleCard
                        active={user?.role === 'employer'}
                        label={t('hiring')}
                        subtitle={t('hiring_subtitle')}
                        icon="office-building-marker"
                        onPress={() => handleSwitchRole('employer')}
                        color="#F59E0B"
                    />
                </View>

                {/* Language Picker */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('language')}</Text>
                </View>
                <View style={styles.languageContainer}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageBtn,
                                i18n.language === lang.code && styles.languageBtnActive
                            ]}
                            onPress={() => changeLanguage(lang.code)}
                        >
                            <MaterialCommunityIcons 
                                name={lang.icon as any} 
                                size={18} 
                                color={i18n.language === lang.code ? '#4F46E5' : '#64748B'} 
                            />
                            <Text style={[
                                styles.languageLabel,
                                i18n.language === lang.code && styles.languageLabelActive
                            ]}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    {user?.role === 'worker' && (
                        <ActionRow
                            icon="account-tie"
                            title={t('professional_profile')}
                            subtitle="Update skills, rates & availability"
                            onPress={() => navigation.navigate('CreateServiceProfile')}
                            color="#4F46E5"
                        />
                    )}
                    {user?.role === 'employer' && (
                        <>
                            <ActionRow
                                icon="plus-circle"
                                title={t('post_listing')}
                                subtitle="Add a property or job vacancy"
                                onPress={() => navigation.navigate('PostListing')}
                                color="#4F46E5"
                            />
                            <ActionRow
                                icon="clipboard-list"
                                title={t('manage_postings')}
                                subtitle="Edit or remove your live ads"
                                onPress={() => navigation.navigate('ManagePosts')}
                                color="#6366F1"
                            />
                        </>
                    )}
                    
                    <ActionRow
                        icon="bell-ring"
                        title={t('notifications')}
                        subtitle="Alerts for jobs & messages"
                        onPress={() => {}}
                        color="#8B5CF6"
                    />
                    
                    <ActionRow
                        icon="shield-check"
                        title="Legal & Privacy"
                        subtitle="Terms of Service"
                        onPress={() => (navigation as any).navigate('Legal')}
                        color="#4F46E5"
                    />
                    
                    <ActionRow
                        icon="help-circle"
                        title={t('help_support')}
                        subtitle="Common issues & contact"
                        onPress={() => (navigation as any).navigate('HelpSupport')}
                        color="#64748B"
                    />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Hinjewadi Connect v1.2.5 • AI Enabled</Text>
            </ScrollView>
        </View>
    );
};

const InfoTile = ({ icon, label, value, color }: any) => (
    <View style={styles.infoTile}>
        <View style={[styles.tileIcon, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View>
            <Text style={styles.tileLabel}>{label}</Text>
            <Text style={styles.tileValue}>{value}</Text>
        </View>
    </View>
);

const RoleCard = ({ active, label, subtitle, icon, onPress, color }: any) => (
    <TouchableOpacity
        style={[styles.roleCard, active && { borderColor: color, backgroundColor: color + '05' }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.roleIcon, { backgroundColor: active ? color : '#F1F5F9' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={active ? '#FFFFFF' : '#64748B'} />
        </View>
        <Text style={[styles.roleLabel, active && { color: color }]}>{label}</Text>
        <Text style={styles.roleSub}>{subtitle}</Text>
    </TouchableOpacity>
);

const ActionRow = ({ icon, title, subtitle, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: color + '10' }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSub}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerGradient: { paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 70, height: 70, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    avatarChar: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
    editAvatarBtn: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#10B981', width: 26, height: 26, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#4F46E5' },
    headerText: { marginLeft: 16, flex: 1 },
    userName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
    userSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
    content: { flex: 1, marginTop: -30 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, ...SHADOWS.medium, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    editAction: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
    infoGrid: { flexDirection: 'row', gap: 16 },
    infoTile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    tileIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    tileLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
    tileValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    form: { gap: 12 },
    label: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: -4 },
    areaGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    areaChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
    areaChipActive: { backgroundColor: '#4F46E510', borderColor: '#4F46E5' },
    areaText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    areaTextActive: { color: '#4F46E5' },
    saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    sectionHeader: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    sectionSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
    roleGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    roleCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9' },
    roleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    roleLabel: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    roleSub: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2, textAlign: 'center' },
    languageContainer: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    languageBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
    languageBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
    languageLabel: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    languageLabelActive: { color: '#4F46E5' },
    actionsContainer: { gap: 12, marginBottom: 30 },
    actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    actionContent: { flex: 1, marginLeft: 16 },
    actionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    actionSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FFFFFF', gap: 8 },
    logoutText: { fontSize: 15, fontWeight: '800', color: '#DC2626' },
    versionText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 24, fontWeight: '600' },
});


